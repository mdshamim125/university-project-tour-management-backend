/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { userSearchableFields } from "./user.constant";
import { QueryBuilder } from "../../utils/QueryBuilder";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

// const updateUser = async (userId: string, payload: Partial<IUser>) => {
//   const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
//     new: true,
//     runValidators: true,
//   });

//   return newUpdatedUser;
// };

const updateUser = async (payload: Partial<IUser>, userId: string) => {
  const user = await User.findById(userId).select("+password");
  // console.log(user);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if user is an OAuth user
  const isOAuthUser =
    user.auths &&
    user.auths.length > 0 &&
    user.auths[0].provider !== "credentials";

  if (payload.password) {
    if (isOAuthUser) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot change password for OAuth users"
      );
    }

    if (!payload.oldPassword) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Old password is required to change password"
      );
    }

    const isOldPasswordMatch = await bcryptjs.compare(
      payload.oldPassword,
      user.password as string
    );
    if (!isOldPasswordMatch) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Old Password does not match"
      );
    }

    // Hash the new password
    user.password = await bcryptjs.hash(
      payload.password,
      Number(envVars.BCRYPT_SALT_ROUND)
    );
  }

  // Update other fields
  Object.keys(payload).forEach((key) => {
    if (key !== "password" && key !== "oldPassword") {
      (user as any)[key] = (payload as any)[key];
    }
  });

  await user.save();
  return user;
};

const updateUserStatus = async (
  userId: string,
  payload: {
    isActive?: boolean;
    isDeleted?: boolean;
    isVerified?: boolean;
  },
  decodedToken: JwtPayload
) => {
  // 🧩 Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // 🚫 Normal users or guides cannot update status fields
  if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  // 🚫 Admin cannot modify super admin
  if (decodedToken.role === Role.ADMIN && user.role === Role.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  // ✅ Proceed with updating allowed fields
  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};
const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

export const UserServices = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  getMe,
  updateUserStatus,
};

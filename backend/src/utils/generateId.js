import { nanoid } from "nanoid";
export const generateRoomId = (len = 8) => nanoid(len);

import bcrypt from "bcrypt";

export class PasswordHelper {
    static async hash(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    static async compare(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
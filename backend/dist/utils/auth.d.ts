export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (payload: {
    id: string;
    email: string;
}) => string;
export declare const generateRefreshToken: (payload: {
    id: string;
    email: string;
}) => string;
export declare const verifyToken: (token: string) => {
    id: string;
    email: string;
};
//# sourceMappingURL=auth.d.ts.map
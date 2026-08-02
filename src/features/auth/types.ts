export interface AuthUser {
    id: string;
    email: string;
    name: string;
}

export interface SignInInput {
    email: string;
    password: string;
}

export interface SignUpInput extends SignInInput {
    confirmPassword: string;
    name: string;
}

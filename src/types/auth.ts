
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
}

export interface LoginResponse {
    success : boolean;
    data :{
        user:  User;
        token: string;
    };
}


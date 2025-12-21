
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string | null;
  status?: 'PENDING' | 'ACTIVE' | 'OFFLINE' | 'ONLINE';
}


export interface LoginResponse {
    success : boolean;
    data :{
        user:  User;
        token: string;
    };
}


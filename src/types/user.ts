export interface User {
    id: string;
    username: string;
    password: string;  // سيتم تخزينه مشفراً
    role: 'admin';
    createdAt: Date;
    lastLogin?: Date;
}

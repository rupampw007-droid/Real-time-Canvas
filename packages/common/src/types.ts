import {email, z} from 'zod'

export const CreateUserSchema = z.object({
    username : z.string().min(3).max(20),
    password : z.string().min(8),
    email: z.email()
})

export const SigninSchema = z.object({
    email : z.string(),
    password: z.string()
})

export const CreateRoomSchema = z.object({
    slug : z.string().min(3).max(20),
  
})
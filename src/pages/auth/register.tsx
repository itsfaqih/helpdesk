import { Button } from "@/components/base/button";
import { Link } from "@/components/base/link";
import { Textbox } from "@/components/derived/textbox";
import { UserSchema } from "@/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import localforage from "localforage";
import { nanoid } from "nanoid";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const RegisterSchema = z
  .object({
    full_name: z.string().nonempty({ message: "Full name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z
      .string()
      .min(8, { message: "Confirm password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password and confirm password must be the same",
    path: ["confirm_password"],
  });

export function RegisterPage() {
  const navigate = useNavigate();
  const registerForm = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
  });

  return (
    <div className="max-w-sm mx-auto mt-32">
      <h1 className="text-2xl font-medium text-center text-gray-800">
        Register
      </h1>
      <form
        onSubmit={registerForm.handleSubmit(async (data) => {
          const unparsedCurrentUsers =
            (await localforage.getItem("users")) ?? [];
          const currentUsers = UserSchema.array().parse(unparsedCurrentUsers);

          const isUserExisted = currentUsers.some(
            (user) => user.email === data.email
          );

          if (isUserExisted) {
            registerForm.setError("email", {
              type: "custom",
              message: "Email is already registered",
            });
            return;
          }

          const newUser = {
            id: nanoid(),
            full_name: data.full_name,
            email: data.email,
            password: data.password,
          };

          const newUsers = [...currentUsers, newUser];

          await localforage.setItem("users", newUsers);
          await localforage.setItem("current_user", newUser);

          navigate("/");
        })}
        className="flex flex-col mt-6 gap-y-4.5"
      >
        <Textbox
          {...registerForm.register("full_name")}
          label="Full Name"
          placeholder="Enter your full name"
          error={registerForm.formState.errors.full_name?.message}
        />
        <Textbox
          {...registerForm.register("email")}
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={registerForm.formState.errors.email?.message}
        />
        <Textbox
          {...registerForm.register("password")}
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={registerForm.formState.errors.password?.message}
        />
        <Textbox
          {...registerForm.register("confirm_password")}
          label="Confirm Password"
          type="password"
          placeholder="Enter confirm password"
          error={registerForm.formState.errors.confirm_password?.message}
        />
        <Button variant="primary" type="submit" className="justify-center">
          Register
        </Button>
      </form>
      <p className="mt-4.5 text-sm text-gray-600 text-center">
        Already have an account? <Link to="/auth/login">Login</Link>
      </p>
    </div>
  );
}

import { Button } from "@/components/base/button";
import { Link } from "@/components/base/link";
import { Checkbox } from "@/components/derived/checkbox";
import { Textbox } from "@/components/derived/textbox";
import { UserSchema } from "@/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import localforage from "localforage";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  remember_me: z.boolean().default(false),
});

export function LoginPage() {
  const navigate = useNavigate();
  const loginForm = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  });

  return (
    <div className="max-w-sm mx-auto mt-32">
      <h1 className="text-2xl font-medium text-center text-gray-800">
        Helpdesk Management
      </h1>
      <form
        onSubmit={loginForm.handleSubmit(async (data) => {
          const unparsedCurrentUsers =
            (await localforage.getItem("users")) ?? [];
          const currentUsers = UserSchema.array().parse(unparsedCurrentUsers);

          const user = currentUsers.find(
            (user) =>
              user.email === data.email && user.password === data.password
          );

          if (user) {
            await localforage.setItem("current_user", user);

            navigate("/");
          } else {
            loginForm.setError(
              "email",
              {
                type: "custom",
                message: "Invalid email or password",
              },
              { shouldFocus: true }
            );
          }
        })}
        className="flex flex-col mt-6 gap-y-4.5"
      >
        <Textbox
          {...loginForm.register("email")}
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={loginForm.formState.errors.email?.message}
        />
        <Textbox
          {...loginForm.register("password")}
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={loginForm.formState.errors.password?.message}
        />
        <div className="flex items-center justify-between">
          <Controller
            name="remember_me"
            control={loginForm.control}
            render={({ field }) => (
              <Checkbox
                ref={field.ref}
                label="Remember me"
                name={field.name}
                onBlur={field.onBlur}
                onChange={({ checked }) => {
                  field.onChange(
                    typeof checked === "boolean" ? checked : false
                  );
                }}
                checked={field.value}
              />
            )}
          />

          <Link to="/auth/forgot-password">Forgot password?</Link>
        </div>
        <Button variant="primary" type="submit" className="justify-center">
          Login
        </Button>
      </form>
      <p className="mt-4.5 text-sm text-gray-600 text-center">
        Not registered yet? <Link to="/auth/register">Register</Link>
      </p>
    </div>
  );
}

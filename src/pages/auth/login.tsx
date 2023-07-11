import { Button } from "@/components/base/button";
import { Link } from "@/components/base/link";
import { Checkbox } from "@/components/derived/checkbox";
import { Textbox } from "@/components/derived/textbox";
import { api } from "@/libs/api.lib";
import {
  AuthResponseSchema,
  LoginSchema,
  LoginSchemaType,
} from "@/schemas/auth.schema";
import { sleep } from "@/utils/delay.util";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { HTTPError } from "ky";
import localforage from "localforage";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();
  const loginForm = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
  });

  const loginMutation = useLoginMutation();

  const onSubmit = loginForm.handleSubmit((data) => {
    loginMutation.mutate(data, {
      async onSuccess(res) {
        await localforage.setItem("current_user", res.data);

        await sleep(1000);
        navigate("/");
      },
      onError(error) {
        if (error instanceof Error) {
          loginForm.setError("email", {
            type: "custom",
            message: error.message,
          });
        }
      },
    });
  });

  return (
    <div className="max-w-sm mx-auto mt-32">
      <h1 className="text-2xl font-medium text-center text-gray-800">
        Helpdesk Management
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col mt-6 gap-y-4.5">
        <Textbox
          {...loginForm.register("email")}
          label="Email"
          type="email"
          placeholder="Enter your email"
          disabled={loginMutation.isLoading}
          error={loginForm.formState.errors.email?.message}
        />
        <Textbox
          {...loginForm.register("password")}
          label="Password"
          type="password"
          placeholder="Enter your password"
          disabled={loginMutation.isLoading}
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
                disabled={loginMutation.isLoading}
              />
            )}
          />

          <Link to="/auth/forgot-password">Forgot password?</Link>
        </div>
        <Button
          variant="primary"
          loading={loginMutation.isLoading}
          success={loginMutation.isSuccess}
          type="submit"
          className="justify-center"
        >
          Login
        </Button>
      </form>
      <p className="mt-4.5 text-sm text-gray-600 text-center">
        Not registered yet? <Link to="/auth/register">Register</Link>
      </p>
    </div>
  );
}

function useLoginMutation() {
  return useMutation({
    async mutationFn(data: LoginSchemaType) {
      try {
        const res = await api.post("login", { json: data }).json();

        return AuthResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof HTTPError) {
          if (error.response.status === 401) {
            throw new Error("Invalid email or password");
          }
        }

        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
  });
}

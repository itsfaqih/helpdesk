import { Button } from "@/components/base/button";
import { FadeInContainer } from "@/components/base/fade-in-container";
import { Link } from "@/components/base/link";
import { Textbox } from "@/components/derived/textbox";
import { api } from "@/libs/api.lib";
import { AuthResponseSchema, RegisterSchema } from "@/schemas/auth.schema";
import { sleep } from "@/utils/delay.util";
import { ConflictError } from "@/utils/error.util";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import localforage from "localforage";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

export function RegisterPage() {
  const navigate = useNavigate();
  const registerForm = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
  });

  const registerMutation = useRegisterMutation();

  const onSubmit = registerForm.handleSubmit((data) => {
    registerMutation.mutate(data, {
      async onSuccess(res) {
        await localforage.setItem("current_admin", res.data);

        await sleep(1000);
        navigate("/");
      },
      onError(error) {
        if (error instanceof Error) {
          registerForm.setError("email", {
            type: "custom",
            message: error.message,
          });
        }
      },
    });
  });

  return (
    <FadeInContainer className="max-w-sm mx-auto mt-32">
      <h1 className="text-2xl font-medium text-center text-gray-800">
        Register
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col mt-6 gap-y-4.5">
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
        <Button
          variant="primary"
          loading={registerMutation.isLoading}
          success={registerMutation.isSuccess}
          type="submit"
          className="justify-center"
        >
          Register
        </Button>
      </form>
      <p className="mt-4.5 text-sm text-gray-600 text-center">
        Already have an account? <Link to="/auth/login">Login</Link>
      </p>
    </FadeInContainer>
  );
}

function useRegisterMutation() {
  return useMutation({
    async mutationFn(data: RegisterSchema) {
      try {
        const res = await api.post(data, "/register");

        return AuthResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof ConflictError) {
          throw new Error("Email is already registered");
        }

        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
  });
}

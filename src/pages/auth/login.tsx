import { Button } from '@/components/base/button';
import { Link } from '@/components/base/link';
import { Checkbox } from '@/components/derived/checkbox';
import { Textbox } from '@/components/derived/textbox';
import { api } from '@/libs/api.lib';
import { AuthResponseSchema, LoginSchema } from '@/schemas/auth.schema';
import { UnauthorizedError } from '@/utils/error.util';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { mockAdminRecords } from '@/mocks/records/admin.record';

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: 'Login',
    });
  };
}

LoginPage.loader = loader;

export function LoginPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const navigate = useNavigate();
  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(LoginSchema),
    defaultValues: mockAdminRecords[0],
  });

  const loginMutation = useLoginMutation();

  const onSubmit = loginForm.handleSubmit((data) => {
    loginMutation.mutate(data, {
      async onSuccess() {
        navigate('/');
      },
      onError(error) {
        if (error instanceof Error) {
          loginForm.setError('email', {
            type: 'custom',
            message: error.message,
          });
        }
      },
    });
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="max-w-xs mx-auto mt-32 sm:max-w-sm">
      <h1 className="text-2xl font-medium text-center text-gray-800">Helpdesk Management</h1>
      <form onSubmit={onSubmit} className="flex flex-col mt-6 gap-y-4.5">
        <Textbox
          {...loginForm.register('email')}
          label="Email"
          type="email"
          placeholder="Enter your email"
          disabled={loginMutation.isPending}
          error={loginForm.formState.errors.email?.message}
        />
        <Textbox
          {...loginForm.register('password')}
          label="Password"
          type="password"
          placeholder="Enter your password"
          disabled={loginMutation.isPending}
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
                onCheckedChange={({ checked }) => {
                  field.onChange(checked === true);
                }}
                checked={field.value}
                disabled={loginMutation.isPending}
              />
            )}
          />

          <Link to="/auth/forgot-password">Forgot password?</Link>
        </div>
        <Button
          variant="filled"
          severity="primary"
          loading={loginMutation.isPending}
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
    </AppPageContainer>
  );
}

function useLoginMutation() {
  return useMutation({
    async mutationFn(data: LoginSchema) {
      try {
        const res = await api.post(data, '/login');

        return AuthResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          throw new Error('Invalid email or password');
        }

        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
  });
}

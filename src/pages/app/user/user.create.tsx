import { AppPageTitle } from '../_components/page-title.app';
import { APIResponseSchema } from '@/schemas/api.schema';
import { UserSchema, CreateUserSchema } from '@/schemas/user.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { UnprocessableEntityError } from '@/utils/error.util';
import { api } from '@/libs/api.lib';
import {
  Select,
  SelectLabel,
  SelectTrigger,
  SelectContent,
  SelectOption,
} from '@/components/base/select';
import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textbox } from '@/components/derived/textbox';
import { userRoleOptions } from '@/utils/user.util';
import { Label } from '@/components/base/label';
import { Card } from '@/components/base/card';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageBackLink } from '../_components/page-back-link';
import { SaveButton } from '@/components/derived/save-button';
import { toast } from '@/components/base/toast';

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: 'Create User',
    });
  };
}

UserCreatePage.loader = loader;

export function UserCreatePage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const navigate = useNavigate();
  const createUserForm = useForm<CreateUserSchema>({
    resolver: zodResolver(CreateUserSchema),
  });

  const createUserMutation = useCreateUserMutation();

  const onSubmit = createUserForm.handleSubmit((data) => {
    createUserMutation.mutate(data, {
      onSuccess(res) {
        navigate(`/users/${res.data.id}`);
      },
    });
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/users" />
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <Card className="px-4.5 py-5 mt-6 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form id="create-user-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="col-span-3">
              <Textbox
                {...createUserForm.register('full_name')}
                label="Full Name"
                placeholder="Enter Full Name"
                disabled={createUserMutation.isPending}
                error={createUserForm.formState.errors.full_name?.message}
                noLabel
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="email">Email</Label>
            <div className="col-span-3">
              <Textbox
                {...createUserForm.register('email')}
                label="Email"
                type="email"
                placeholder="Enter Email"
                disabled={createUserMutation.isPending}
                error={createUserForm.formState.errors.email?.message}
                noLabel
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="password">Password</Label>
            <div className="col-span-3">
              <Textbox
                {...createUserForm.register('password')}
                label="Password"
                type="password"
                placeholder="Enter Password"
                disabled={createUserMutation.isPending}
                error={createUserForm.formState.errors.password?.message}
                noLabel
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="role">Role</Label>
            <div className="col-span-3">
              <Controller
                control={createUserForm.control}
                name="role"
                render={({ field }) => (
                  <Select
                    name={field.name}
                    disabled={createUserMutation.isPending}
                    items={userRoleOptions}
                    onValueChange={(e) => {
                      const value = e.value[0];

                      if (value === 'super_admin' || value === 'operator') {
                        field.onChange(value);
                      }
                    }}
                    value={[field.value]}
                  >
                    <div className="grid w-full items-center gap-1.5">
                      <SelectLabel className="sr-only">Role</SelectLabel>
                      <SelectTrigger
                        ref={field.ref}
                        error={createUserForm.formState.errors.role?.message}
                        placeholder="Select role"
                        className="w-full"
                      />
                    </div>
                    <SelectContent>
                      {userRoleOptions.map((option) => (
                        <SelectOption key={option.value} item={option} />
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <SaveButton
              type="submit"
              loading={createUserMutation.isPending}
              success={createUserMutation.isSuccess}
            />
          </div>
        </form>
      </Card>
    </AppPageContainer>
  );
}

const CreateUserResponseSchema = APIResponseSchema({
  schema: UserSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: CreateUserSchema) {
      try {
        const res = await api.post(data, '/users');

        return CreateUserResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof UnprocessableEntityError) {
          throw new Error('Email is already registered');
        }

        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      toast.create({
        title: 'User created successfully',
        type: 'success',
      });

      await queryClient.invalidateQueries({ queryKey: ['user', 'index'] });
    },
  });
}

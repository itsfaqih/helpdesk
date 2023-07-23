import { Button } from "@/components/base/button";
import { Link } from "@/components/base/link";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { Textbox } from "@/components/derived/textbox";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { useLoaderData } from "react-router-dom";

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: "Forgot Password",
    });
  };
}

ForgotPasswordPage.loader = loader;

export function ForgotPasswordPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  return (
    <AppPageContainer
      title={loaderData.pageTitle}
      className="max-w-sm mx-auto mt-32"
    >
      <h1 className="text-2xl font-medium text-center text-gray-800">
        Forgot Password
      </h1>
      <form className="flex flex-col mt-6 gap-y-4.5">
        <Textbox
          label="Registered Email"
          type="email"
          placeholder="Enter your registered email"
        />
        <Button variant="primary" type="submit" className="justify-center">
          Reset Password
        </Button>
      </form>
      <p className="mt-4.5 text-sm text-gray-600 text-center">
        Recalled your password already?{" "}
        <Link to="/auth/login">Back to login</Link>
      </p>
    </AppPageContainer>
  );
}

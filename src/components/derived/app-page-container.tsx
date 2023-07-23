import React from "react";
import { FadeInContainer } from "../base/fade-in-container";
import { useTitle, useTitleTemplate } from "hoofd";

type AppPageContainerProps = React.ComponentPropsWithoutRef<
  typeof FadeInContainer
> & {
  title: string;
};

export function AppPageContainer({ title, ...props }: AppPageContainerProps) {
  useTitleTemplate("%s | Helpdesk Management");
  useTitle(title);

  return <FadeInContainer {...props} />;
}

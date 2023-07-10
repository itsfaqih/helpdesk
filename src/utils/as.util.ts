import React from "react";

// --------------------
// GENERIC TYPES
// --------------------

/**
 * The "as" prop type.
 */
type As<Props = any> = React.ElementType<Props>;
// tests (uncomment to see the outputs)
// type Example = As<{ prop: string }>

/**
 * Props object that includes the "as" prop.
 */
export type PropsWithAs<Props = {}, Type extends As = As> = Props &
  Omit<React.ComponentProps<Type>, "as" | keyof Props> & {
    as?: Type;
  };
// tests (uncomment to see the outputs)
// type Example = PropsWithAs<{ prop: string }, As<{ prop2: string }>>["as"];
// type Example = PropsWithAs<{ prop: string }, As<{ prop2: string }>>["prop"];
// type Example = PropsWithAs<{ prop: string }, As<{ prop2: string }>>["prop2"];
// type Example = PropsWithAs<{ prop: string }, "a">["as"];
// type Example = PropsWithAs<{ prop: string }, "a">["href"];

/**
 * A component with the "as" prop.
 */
type ComponentWithAs<Props, DefaultType extends As> = {
  <Type extends As>(
    props: PropsWithAs<Props, Type> & { as: Type }
  ): JSX.Element;
  (props: PropsWithAs<Props, DefaultType>): JSX.Element;
};
// tests (uncomment to see the outputs)
// type Example = ComponentWithAs<{ prop: string }, "button">;

// --------------------
// UTILS
// --------------------

export function forwardRefWithAs<Props, DefaultType extends As>(
  component: React.ForwardRefRenderFunction<any>
) {
  return React.forwardRef(component) as unknown as ComponentWithAs<
    Props,
    DefaultType
  >;
}

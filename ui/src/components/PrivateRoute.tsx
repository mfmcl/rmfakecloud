import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuthState } from "../common/useAuthContext";

type RouteProp = {
  component: React.ComponentType<Record<string, unknown>>;
  roles?: string[];
  exact?: boolean;
  path: string;
};

export const PrivateRoute = ({
  component: Component,
  roles,
  ...rest
}: RouteProp) => {
  const { state:{user} } = useAuthState(); //read the values of loading and errorMessage from context
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!user) {
          // not logged in so redirect to login page with the return url
          return (
            <Redirect
              to={{ pathname: "/login", state: { from: props.location } }}
            />
          );
        }

        // check if route is restricted by role
        if (roles && user.Roles && roles.indexOf(user.Roles[0]) === -1) {
          // role not authorised ==> send them back home
          return <Redirect to={{ pathname: "/" }} />;
        }

        // authorised so return component
        return <Component {...props} />;
      }}
    />
  );
};

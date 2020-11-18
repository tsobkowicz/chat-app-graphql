/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { useAuthState } from '../context/auth';

export default function DynamicRoute(props) {
  const { user } = useAuthState();

  if (props.authenticated && !user) {
    return <Redirect to="/login" />;
  }
  if (props.guest && user) {
    return <Redirect to="/" />;
  }
  return <Route component={props.component} {...props} />;
}

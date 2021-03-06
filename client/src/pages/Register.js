/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { gql, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';

const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      username: $username
      email: $email
      password: $password
      confirmPassword: $confirmPassword
    ) {
      username
      email
      createdAt
    }
  }
`;

export default function Register(props) {
  const [variables, setVariables] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const { email, username, password, confirmPassword } = variables;

  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    update: () => props.history.push('/login'),
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
  });

  const handleChange = (e) => {
    setVariables({ ...variables, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    registerUser({ variables });
  };

  return (
    <Row className="bg-white py-5 justify-content-center">
      <Col sm={8} md={6} lg={4}>
        <h1 className="text-center">Register</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label className={errors.email && 'text-danger'}>
              {errors.email ?? 'Email address'}
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={email}
              className={errors.email && 'is-invalid'}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className={errors.username && 'text-danger'}>
              {errors.username ?? 'Username'}
            </Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={username}
              className={errors.username && 'is-invalid'}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className={errors.password && 'text-danger'}>
              {errors.password ?? 'Password'}
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={password}
              className={errors.password && 'is-invalid'}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className={errors.confirmPassword && 'text-danger'}>
              {errors.confirmPassword ?? 'Confirm password'}
            </Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              className={errors.confirmPassword && 'is-invalid'}
              onChange={handleChange}
            />
          </Form.Group>
          <div className="text-center">
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? 'loading...' : 'Register'}
            </Button>
          </div>
          <br />
          <small>
            Already have an account? <Link to="/login">Login</Link>
          </small>
        </Form>
      </Col>
    </Row>
  );
}

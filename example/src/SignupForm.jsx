import { Button } from "../design-system/src/atoms/Button";

export function SignupForm({ onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <h2>Create Your Account!</h2>
      <label htmlFor="email">E-Mail Address</label>
      <input id="email" type="email" placeholder="Enter Your E-mail Here..." />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" placeholder="password" />
      <Button type="submit">SIGN UP NOW</Button>
      <p>
        Already have an account? <a href="/login">Log In</a>
      </p>
    </form>
  );
}

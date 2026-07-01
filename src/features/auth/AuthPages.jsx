import { useMemo, useState } from "react";

function validateSignIn(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

function validateSignUp(values) {
  const errors = {};

  const requiredFields = [
    ["firstName", "First name is required."],
    ["lastName", "Last name is required."],
    ["email", "Email is required."],
    ["mobile", "Mobile number is required."],
    ["username", "Username is required."],
    ["role", "Role is required."],
    ["password", "Password is required."],
    ["confirmPassword", "Confirm password is required."]
  ];

  requiredFields.forEach(([field, message]) => {
    if (!values[field]?.trim()) {
      errors[field] = message;
    }
  });

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.mobile && !/^\d{10,15}$/.test(values.mobile.replace(/\s+/g, ""))) {
    errors.mobile = "Please enter a valid mobile number.";
  }

  if (values.password && values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function Field({ label, id, type = "text", placeholder, value, onChange, error }) {
  return (
    <div className="za-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p className="za-field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({ label, id, value, onChange, error, options }) {
  return (
    <div className="za-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">Select role</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="za-field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Header({ mode, onModeChange }) {
  return (
    <header className="za-auth-header">
      <div className="za-auth-brand">
        <div className="za-auth-logo">Z</div>
        <div>
          <h1>Zariya</h1>
          <p>Secure donor operations portal</p>
        </div>
      </div>

      <div className="za-auth-tabs" role="tablist" aria-label="Authentication pages">
        <button
          className={mode === "signIn" ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={mode === "signIn"}
          onClick={() => onModeChange("signIn")}
        >
          Sign in
        </button>
        <button
          className={mode === "signUp" ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={mode === "signUp"}
          onClick={() => onModeChange("signUp")}
        >
          Sign up
        </button>
      </div>
    </header>
  );
}

function SignInForm({ onSwitchToSignUp }) {
  const [values, setValues] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const errors = useMemo(() => validateSignIn(values), [values]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setStatusMessage("Sign in request validated. Integrate API handler to continue.");
  }

  return (
    <form className="za-auth-form" onSubmit={handleSubmit} noValidate>
      <div className="za-form-heading">
        <h2>Welcome back</h2>
        <p>Sign in to your account</p>
      </div>

      <Field
        label="Email address"
        id="email"
        type="email"
        placeholder="Enter your email"
        value={values.email}
        onChange={handleChange}
        error={submitted ? errors.email : ""}
      />

      <Field
        label="Password"
        id="password"
        type="password"
        placeholder="Enter your password"
        value={values.password}
        onChange={handleChange}
        error={submitted ? errors.password : ""}
      />

      <div className="za-form-row">
        <label className="za-checkbox">
          <input
            type="checkbox"
            name="rememberMe"
            checked={values.rememberMe}
            onChange={handleChange}
          />
          <span>Remember me</span>
        </label>
        <button type="button" className="za-link-button">
          Forgot password?
        </button>
      </div>

      <button type="submit" className="za-primary-button">
        Login
      </button>

      <p className="za-switch-text">
        Don&apos;t have an account?{" "}
        <button type="button" className="za-link-button" onClick={onSwitchToSignUp}>
          Register
        </button>
      </p>

      {statusMessage ? <p className="za-status-message">{statusMessage}</p> : null}
    </form>
  );
}

function SignUpForm({ onSwitchToSignIn }) {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    username: "",
    role: "",
    password: "",
    confirmPassword: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const errors = useMemo(() => validateSignUp(values), [values]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setStatusMessage("Registration request validated. Integrate API handler to continue.");
  }

  return (
    <form className="za-auth-form za-auth-form-wide" onSubmit={handleSubmit} noValidate>
      <div className="za-form-heading">
        <h2>Register user</h2>
        <p>Create a new account</p>
      </div>

      <div className="za-grid">
        <Field
          label="First name"
          id="firstName"
          placeholder="Enter first name"
          value={values.firstName}
          onChange={handleChange}
          error={submitted ? errors.firstName : ""}
        />
        <Field
          label="Last name"
          id="lastName"
          placeholder="Enter last name"
          value={values.lastName}
          onChange={handleChange}
          error={submitted ? errors.lastName : ""}
        />
        <Field
          label="Email ID"
          id="email"
          type="email"
          placeholder="Enter email"
          value={values.email}
          onChange={handleChange}
          error={submitted ? errors.email : ""}
        />
        <Field
          label="Mobile no"
          id="mobile"
          placeholder="Enter mobile number"
          value={values.mobile}
          onChange={handleChange}
          error={submitted ? errors.mobile : ""}
        />
        <Field
          label="Username"
          id="username"
          placeholder="Choose username"
          value={values.username}
          onChange={handleChange}
          error={submitted ? errors.username : ""}
        />
        <SelectField
          label="Role"
          id="role"
          value={values.role}
          onChange={handleChange}
          error={submitted ? errors.role : ""}
          options={[
            { value: "donor-manager", label: "Donor Manager" },
            { value: "finance-lead", label: "Finance Lead" },
            { value: "admin", label: "Admin" }
          ]}
        />
        <Field
          label="Password"
          id="password"
          type="password"
          placeholder="Enter password"
          value={values.password}
          onChange={handleChange}
          error={submitted ? errors.password : ""}
        />
        <Field
          label="Confirm password"
          id="confirmPassword"
          type="password"
          placeholder="Confirm password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={submitted ? errors.confirmPassword : ""}
        />
      </div>

      <div className="za-form-actions">
        <p className="za-switch-text">
          Already have an account?{" "}
          <button type="button" className="za-link-button" onClick={onSwitchToSignIn}>
            Login
          </button>
        </p>
        <button type="submit" className="za-primary-button">
          Register
        </button>
      </div>

      {statusMessage ? <p className="za-status-message">{statusMessage}</p> : null}
    </form>
  );
}

export function AuthPages() {
  const [mode, setMode] = useState("signIn");

  return (
    <div className="za-auth-shell">
      <div className="za-auth-left-rail" />

      <div className="za-auth-main">
        <Header mode={mode} onModeChange={setMode} />

        <main className="za-auth-content">
          {mode === "signIn" ? (
            <SignInForm onSwitchToSignUp={() => setMode("signUp")} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setMode("signIn")} />
          )}
        </main>

        <footer className="za-auth-footer">
          <p>&copy; 2026 Zariya. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

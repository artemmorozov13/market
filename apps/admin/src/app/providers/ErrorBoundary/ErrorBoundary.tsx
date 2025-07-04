import React, { Component, ReactNode } from "react";
import { Typography, Button } from "@mui/material";
import styles from "./ErrorBoundary.module.scss"; // Подключаем стили

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className={styles.errorContainer}>
          <Typography variant="h4" className={styles.title}>
            Что-то пошло не так 😔
          </Typography>
          <Typography variant="body1" className={styles.description}>
            {error?.message || "Произошла непредвиденная ошибка."}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className={styles.button}
            onClick={() => window.location.reload()}
          >
            Перезагрузить страницу
          </Button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
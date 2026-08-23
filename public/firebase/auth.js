window.AuroraAuthService = (function () {
  function getAuth() {
    return window.AuroraFirebase.getAuth();
  }

  function mapFirebaseError(err) {
    const code = err && err.code ? String(err.code) : "";
    const name = err && err.name ? String(err.name) : "";
    switch (code) {
      case "auth/invalid-email":
      case "auth/missing-email":
        return "invalidEmail";
      case "auth/user-not-found":
        return "userNotFound";
      case "auth/wrong-password":
      case "auth/invalid-credential":
      case "auth/missing-password":
        return "invalidCredential";
      case "auth/email-already-in-use":
      case "auth/credential-already-in-use":
        return "emailInUse";
      case "auth/weak-password":
        return "weakPassword";
      case "auth/network-request-failed":
      case "auth/internal-error":
        return "network";
      case "auth/popup-closed-by-user":
        return "popupClosed";
      case "auth/popup-blocked":
        return "popupBlocked";
      case "auth/operation-not-allowed":
        return "operationNotAllowed";
      case "auth/admin-restricted-operation":
        return "guestNotEnabled";
      case "auth/too-many-requests":
        return "tooManyRequests";
      case "auth/user-disabled":
        return "userDisabled";
      case "auth/invalid-api-key":
      case "auth/unauthorized-domain":
      case "auth/app-not-authorized":
      case "auth/web-storage-unsupported":
        return "configError";
      default:
        try {
          console.warn("[auth] unhandled error", code, name, err && err.message);
        } catch {}
        return "generic";
    }
  }

  async function signIn(email, password) {
    const cred = await getAuth().signInWithEmailAndPassword(email, password);
    return cred.user;
  }

  async function signUp(name, email, password) {
    const cred = await getAuth().createUserWithEmailAndPassword(email, password);
    if (name) {
      await cred.user.updateProfile({ displayName: name });
    }
    return cred.user;
  }

  function signOutUser() {
    return getAuth().signOut();
  }

  async function sendPasswordReset(email) {
    return getAuth().sendPasswordResetEmail(email);
  }

  function onAuthStateChanged(cb) {
    return getAuth().onAuthStateChanged(cb);
  }

  return {
    mapFirebaseError,
    signIn,
    signUp,
    signOutUser,
    sendPasswordReset,
    onAuthStateChanged,
  };
})();

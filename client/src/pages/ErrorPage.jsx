import "../styles/ErrorPage.css";

function ErrorPage() {
  return (
    <div>
      <main id="error-cont">
        <h1>Uh oh.. Looks like this page doesn't exist or is under construction!</h1>
        <img className="error-img" src="/error.png" />
      </main>
    </div>
  );
}

export default ErrorPage;

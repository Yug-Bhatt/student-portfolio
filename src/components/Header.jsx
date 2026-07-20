function Header(props) {
  return (
    <header className="header">
      <h1>{props.name}</h1>
      <p>{props.course}</p>
    </header>
  );
}

export default Header;
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Container className="mt-4">
      <h1>404 - ページが見つかりません</h1>
      <p>お探しのページは存在しません。</p>
      <Link to="/">ホームに戻る</Link>
    </Container>
  );
}

export default NotFound;

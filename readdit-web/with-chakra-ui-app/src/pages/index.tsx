import { withUrqlClient } from "next-urql";
import Navbar from "../components/Navbar";
import { createUrqlClient } from "../utils/createUrqlClient";
import {usePostsQuery} from '../generated/graphql';

const Index = () => {
  const [{data}] = usePostsQuery()
  return (
    <>
      <Navbar />
      {!data ? (
        <div>Loading...</div>
      ) : data.posts.map((post) => <div key={post.id}>{post.title}</div>)}
    </>
  )
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

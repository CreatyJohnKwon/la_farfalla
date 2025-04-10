import { Post } from "../../types/interfaces";

const Tags = ({ post }: { post: Post }) => {
    return (
        <>
            {post.tag.map((tag, index) => (
                <span
                    key={index}
                    className="text-sans me-1 text-sm text-gray-400 transition-all duration-700 ease-in-out"
                >{`#${tag}`}</span>
            ))}
        </>
    );
};

export default Tags;

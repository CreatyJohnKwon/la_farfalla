import { Post } from "../../types/interfaces";

const Tags = ({ post }: { post: Post }) => {
    return (
        <>
            {
                post.tag.map((tag, index) => (
                    <span key={index} className="text-sm c_base:text-base font-sans text-gray-500 me-1">{`#${tag}`}</span>
                ))
            }
        </>
    );
};

export default Tags;
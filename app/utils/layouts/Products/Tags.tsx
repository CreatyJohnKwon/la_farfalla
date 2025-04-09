import { Post } from "../../types/interfaces";

const Tags = ({ post }: { post: Post }) => {
    return (
        <>
            {
                post.tag.map((tag, index) => (
                    <span key={index} className="text-sm md:text-base font-light me-1 transition-all duration-700 ease-in-out">{`#${tag}`}</span>
                ))
            }
        </>
    );
};

export default Tags;
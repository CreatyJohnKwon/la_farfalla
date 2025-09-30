const PCSkeleton = ({
    isFetchingNextPage
}: {
    isFetchingNextPage: boolean
}) => {
    return (
        <>
            {isFetchingNextPage && (
                <div className="hidden lg:block">
                    <table className="w-full min-w-[700px] table-fixed text-left text-sm">
                        <tbody>
                            {[...Array(3)].map((_, index) => (
                                <tr
                                    key={`desktop-skeleton-${index}`}
                                    className="animate-fade-in border-b"
                                >
                                    <td className="px-4 py-3">
                                        <div className="h-20 w-20 rounded-sm bg-gray-200" />
                                    </td>
                                    <td colSpan={8}>
                                        <div className="space-y-2">
                                            <div className="h-4 w-[80%] rounded bg-gray-200" />
                                            <div className="h-4 w-[60%] rounded bg-gray-200" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}

export default PCSkeleton;
import { useEffect, useState, useMemo } from 'react'
import { useColor } from 'color-thief-react'
import ReactPaginate from 'react-paginate'
import Wearable from './Wearable'

export const WearablesCard = ({
    wearables,
    equipped,
    equippedWearables,
    selectedTrait,
}) => {
    const pageLength = 6
    const [page, setPage] = useState(1)

    useEffect(() => {
        setPage(1)
    }, [selectedTrait])

    const pagginationHandler = (page) => {
        setPage(page.selected + 1)
    }

    if (!wearables) return null
    return (
        <>
            <div className="w-full h-full hidden sm:flex flex-col flex-shrink  lg:skew-y-3 z-20">
                <div className="sm:pl-0 sm:grid sm:grid-cols-3 sm:gap-1 pl-2 md:grid-cols-2 md:gap-2 lg:gap-4 w-full transition-colors transform relative">
                    {wearables
                        .slice(
                            (page - 1) * pageLength,
                            (page - 1) * pageLength + pageLength
                        )
                        .map((wearable, i) => (
                            <Wearable
                                key={wearable.id}
                                data={wearable}
                                equipped={equipped}
                                equippedWearables={equippedWearables}
                                selectedTrait={selectedTrait}
                            />
                        ))}
                </div>
                <div
                    className={
                        'flex justify-center mt-0 lg:mt-2' +
                        (wearables.length < pageLength ? ' hidden' : '')
                    }
                >
                    <ReactPaginate
                        previousLabel={'<'}
                        previousClassName={
                            'previous mr-2 py-1.5 rounded-sm px-2 hover:bg-gray-700'
                        }
                        nextLabel={'>'}
                        nextClassName={'ml-2 py-1.5 px-2 rounded-sm  hover:bg-gray-700'}
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        activeClassName={'active border-b-2 border-white'}
                        containerClassName={'flex list-style-none items-center'}
                        pageClassName={'page-item'}
                        pageLinkClassName={
                            'page-link relative block py-1.5 px-2 text-center items-center rounded-sm border-0 bg-transparent outline-none transition-all duration-300 text-gray-800 hover:text-gray-800 hover:bg-gray-700 focus:shadow-none'
                        }
                        subContainerClassName={'pages pagination'}
                        initialPage={page - 1}
                        pageCount={Math.ceil(wearables.length / pageLength)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={6}
                        onPageChange={pagginationHandler}
                    />
                </div>
            </div>
        </>
    )
}

type TableFiltersProps = {
    searchValue: string
    setSearchValue: (value: string) => void
}

export const TableFilters = ({ searchValue, setSearchValue }: TableFiltersProps) => {
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className="relative w-full sm:w-80">
                <input
                    type="text"
                    placeholder="Search name, email, phone, id, age..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wide text-gray-400">
                    Enter
                </span>
            </div>
            {searchValue && (
                <button
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow"
                    onClick={() => setSearchValue('')}
                >
                    Clear
                </button>
            )}
        </div>
    )
}

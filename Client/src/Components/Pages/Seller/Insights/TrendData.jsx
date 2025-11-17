import React, { useState, useEffect } from "react";

const TrendData = ({ trendData }) => {
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: "interaction_count", direction: "descending" });
    const itemsPerPage = 5;
    const [filter, setFilter] = useState("1m");

    useEffect(() => {
        // Sort data initially by interaction count, descending
        const sortedData = [...trendData].sort((a, b) => b.interaction_count - a.interaction_count);
        setFilteredData(sortedData);
        applyFilter("1m"); // Apply default filter
    }, [trendData]);

    const applyFilter = (timeframe) => {
        const currentDate = new Date();
        let filtered;

        switch (timeframe) {
            case "1m":
                filtered = trendData?.filter(
                    (data) => new Date(data.month).getMonth() === currentDate.getMonth()
                );
                break;
            case "6m":
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
                filtered = trendData?.filter(
                    (data) => new Date(data.month) >= sixMonthsAgo
                );
                break;
            case "1y":
                filtered = trendData?.filter(
                    (data) => new Date(data.month).getFullYear() === currentDate.getFullYear()
                );
                break;
            case "2y":
                const twoYearsAgo = new Date();
                twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);
                filtered = trendData?.filter(
                    (data) => new Date(data.month) >= twoYearsAgo
                );
                break;
            default:
                filtered = trendData;
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handlePageChange = (direction) => {
        setCurrentPage((prev) => prev + direction);
    };

    const handleSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
        sortData(key, direction);
    };

    const sortData = (key, direction) => {
        const sortedData = [...filteredData].sort((a, b) => {
            if (key === "month") {
                return direction === "ascending"
                    ? new Date(a.month) - new Date(b.month)
                    : new Date(b.month) - new Date(a.month);
            } else if (key === "title") {
                return direction === "ascending"
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            } else {
                return direction === "ascending" ? a[key] - b[key] : b[key] - a[key];
            }
        });
        setFilteredData(sortedData);
    };

    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === "ascending" ? "↑" : "↓";
        }
        return key === "interaction_count" && sortConfig.direction === "descending" ? "↓" : null;
    };

    const renderTrendIcon = (interactionTrend) => {
        switch (interactionTrend) {
            case "1":
                return <img src="/img/trend-rise.png"  alt="rise"/> // Increase
            case "-1":
                return <img src="/img/trend-decline.png"  alt="decline"/>  // Decrease
            case "0":
            default:
                return <img src="/img/trend-neutral.png" className="w-16 h-8 object-cover"  alt="neutral"/>// No Change
        }
    };

    return (
        <div className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Trend Data</h2>

            {/* Timeframe Filter Buttons */}
            <div className="flex space-x-4 mb-6">
                {["1m", "6m", "1y", "2y"].map((timeframe) => (
                    <button
                        key={timeframe}
                        onClick={() => {
                            setFilter(timeframe);
                            applyFilter(timeframe);
                        }}
                        className={`px-4 py-2 rounded-lg ${filter === timeframe ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                            }`}
                    >
                        {timeframe.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Trend Data Table */}
            <table className="w-full bg-white shadow-md rounded-lg mb-4">
                <thead>
                    <tr>
                        <th
                            className="p-3 text-left font-semibold text-gray-600 cursor-pointer"
                            onClick={() => handleSort("title")}
                        >
                            Product {renderSortArrow("title")}
                        </th>
                         <th className="p-3 text-left font-semibold text-gray-600">Trend</th>
                        <th
                            className="p-3 text-left font-semibold text-gray-600 cursor-pointer"
                            onClick={() => handleSort("interaction_count")}
                        >
                            Interaction Count {renderSortArrow("interaction_count")}
                        </th>
                        <th
                            className="p-3 text-left font-semibold text-gray-600 cursor-pointer"
                            onClick={() => handleSort("avg_interaction_score")}
                        >
                            Avg Interaction Score {renderSortArrow("avg_interaction_score")}
                        </th>
                        <th
                            className="p-3 text-left font-semibold text-gray-600 cursor-pointer"
                            onClick={() => handleSort("interaction_weight")}
                        >
                            Interaction Weight {renderSortArrow("interaction_weight")}
                        </th>
                        <th
                            className="p-3 text-left font-semibold text-gray-600 cursor-pointer"
                            onClick={() => handleSort("month")}
                        >
                            Month {renderSortArrow("month")}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData?.map((data) => (
                        <tr key={data._id} className="border-b">
                            <td className="p-3 text-gray-700 flex items-center">
                                <img
                                    src={`http://localhost:8080/uploads/${data.thumbnail}`}
                                    alt={data.title}
                                    className="w-10 h-10 rounded mr-3"
                                />
                                <span>{data.title}</span>
                            </td>
                            <td className="p-3 text-gray-700">
                                {renderTrendIcon(data.interaction_trend)}
                            </td>
                            <td className="p-3 text-gray-700">{data.interaction_count}</td>
                            <td className="p-3 text-gray-700">{data.avg_interaction_score.toFixed(2)}</td>
                            <td className="p-3 text-gray-700">{data.interaction_weight}</td>
                            <td className="p-3 text-gray-700">{data.month}</td>

                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => handlePageChange(-1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                <p className="text-gray-700">
                    Page {currentPage} of {totalPages}
                </p>
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default TrendData;

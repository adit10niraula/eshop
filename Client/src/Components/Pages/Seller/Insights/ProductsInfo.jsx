import React, { useState } from 'react';

const ProductsInfo = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Calculate interaction demand and sort
    const calculateAndSortDemand = (products) => {
        const interactionCounts = products.map((product) => product.ml_features?.interaction_weight || 0);

        // Calculate thresholds
        const sortedCounts = [...interactionCounts].sort((a, b) => a - b);
        const lowThreshold = sortedCounts[Math.floor(sortedCounts.length * 0.25)];
        const highThreshold = sortedCounts[Math.floor(sortedCounts.length * 0.75)];

        // Assign demand levels and sort
        return products
            .map((product) => {
                const interactionWeight = product.ml_features?.interaction_weight || 0;
                let demand = 'Low Demand';

                if (interactionWeight >= highThreshold) {
                    demand = 'High Demand';
                } else if (interactionWeight >= lowThreshold) {
                    demand = 'Moderate Demand';
                }

                return { ...product, demand, interactionWeight };
            })
            .sort((a, b) => {
                // Sort by demand level first
                const demandOrder = { 'High Demand': 1, 'Moderate Demand': 2, 'Low Demand': 3 };
                const demandComparison = demandOrder[a.demand] - demandOrder[b.demand];

                // If same demand level, sort by interaction weight
                if (demandComparison === 0) {
                    return b.interactionWeight - a.interactionWeight;
                }

                return demandComparison;
            });
    };

    const sortedProducts = calculateAndSortDemand(products);

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const getBadgeDetails = (demand) => {
        switch (demand) {
            case 'High Demand':
                return { color: 'bg-green-200 text-green-800', label: 'High Demand' };
            case 'Moderate Demand':
                return { color: 'bg-blue-200 text-blue-800', label: 'Moderate Demand' };
            case 'Low Demand':
                return { color: 'bg-red-200 text-red-800', label: 'Low Demand' };
            default:
                return { color: 'bg-gray-200 text-gray-800', label: 'No Data' };
        }
    };

    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Information</h2>
            <ul>
                {paginatedProducts.map((product) => {
                    const { color, label } = getBadgeDetails(product.demand);

                    return (
                        <li
                            key={product.product_id}
                            className="relative flex items-center bg-white p-4 rounded-lg shadow-md mb-4"
                        >
                            {/* Badge for Demand Level */}
                            <span
                                className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${color}`}
                            >
                                {label}
                            </span>

                            <img
                                src={`http://localhost:8080/uploads/${product.thumbnail}`}
                                alt={product.product_name}
                                className="w-16 h-16 rounded-lg mr-4"
                            />
                            <div className="flex-1">
                                <p className="text-lg font-semibold text-gray-700">
                                    {truncateText(product.product_name, 30)}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">{product.message}</p>

                                {/* ML Features */}
                                <div className="mt-2">
                                    <p className="text-xs text-gray-500">
                                        <strong>Interaction Weight:</strong> {product.ml_features?.interaction_weight || 'No data'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        <strong>Recency:</strong> {(product.ml_features?.recency || 0).toFixed(4)}
                                    </p>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                <p className="text-gray-700">
                    Page {currentPage} of {totalPages}
                </p>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ProductsInfo;

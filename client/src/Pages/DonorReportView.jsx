import React, { useContext, useEffect, useState } from 'react';
import Web3Context from '../store/Web3Context';
import { useParams } from 'react-router-dom';

const DonorReportView = () => {
    const { state } = useContext(Web3Context);
    const { contract } = state;
    const { id } = useParams(); // assuming id is the charity/campaign ID
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                if (contract) {
                    const report = await contract.getReport(id);
                    setReport(report);
                } else {
                    setError('Metamask disconnected.');
                }
            } catch (err) {
                setError('Failed to fetch the report.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [contract, id]);

    if (loading) {
        return <div className="text-white">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="w-full h-screen flex justify-center items-center bg-gray-800">
            <div className="container md:ml-64 mx-auto my-10 p-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">Campaign Report</h1>
                {report ? (
                    <div className="text-white">
                        <h2 className="text-xl font-semibold mb-4">Report for Campaign ID: {id}</h2>
                        <p className="mb-6">The following documents have been submitted:</p>
                        <ul className="list-disc list-inside">
                            {report.split(', ').map((url, index) => (
                                <li key={index}>
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                                        Report Document {index + 1}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-white">No report available for this campaign.</p>
                )}
            </div>
        </div>
    );
};

export default DonorReportView;

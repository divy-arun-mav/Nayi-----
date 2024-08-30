import React, { useContext, useState } from 'react';
import Web3Context from '../store/Web3Context';
import { ethers } from 'ethers';
import axios from 'axios';
import { useAuth } from '../store/auth';
import { useNavigate, useParams } from 'react-router-dom';

const Donate = () => {
    const [amount, setAmount] = useState('');
    const [charityId, setCharityId] = useState('');
    const { state } = useContext(Web3Context);
    const { contract } = state;
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    if (!id) {
        return alert('not a valid id found')
    }

    const donate = async () => {
        try {
            if (contract) {
                const transaction = await contract.donate(charityId, {
                    value: ethers.utils.parseEther(amount),
                });

                console.log('Transaction:', transaction);

                await transaction.wait();

                await saveDonationDetails(transaction.hash, amount, charityId);

                alert('Donation made successfully');
            } else {
                alert('Metamask disconnected.');
            }
        } catch (error) {
            console.error('Error donating: ', error);
            alert('Failed to donate.');
        }
    };

    const saveDonationDetails = async (hash, amount, charityId) => {
        try {
            const response = await axios.patch('http://localhost:5000/donate', {
                hash,
                amount,
                BcampaignId: charityId,
                campaignId: id  
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Donation saved:', response.data);
            navigate('/donations');
        } catch (error) {
            console.error('Error saving donation:', error);
            alert('Failed to save donation.');
        }
    };

    return (
        <div className="w-full h-screen flex justify-center items-center bg-gray-800">
            <div className="container md:ml-64 mx-auto my-10 p-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-6 text-center overflow-hidden">Donate to Charity</h1>
                <div className="mb-6">
                    <label className="block text-gray-400 font-medium mb-2" htmlFor="amount">
                        Donation Amount (in Ether)
                    </label>
                    <input
                        type="text"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter donation amount"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-400 font-medium mb-2" htmlFor="charityId">
                        Campaign ID
                    </label>
                    <input
                        type="text"
                        id="charityId"
                        value={charityId}
                        onChange={(e) => setCharityId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter campaign ID"
                    />
                </div>
                <button
                    onClick={donate}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                    Donate
                </button>
            </div>
        </div>
    );
};

export default Donate;

import React, { useContext, useState, useRef } from 'react';
import Web3Context from '../store/Web3Context';
import axios from 'axios';
import { useAuth } from '../store/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const SubmitReport = () => {
    const [charityId, setCharityId] = useState('');
    const [reportText, setReportText] = useState('');
    const [files, setFiles] = useState([]);
    const canvasRef = useRef(null);
    const { state } = useContext(Web3Context);
    const { contract } = state;
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    if (!id) {
        return alert('Not a valid ID found');
    }

    const handleUpload = async (image) => {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);
        data.append("cloud_name", process.env.REACT_APP_CLOUD_NAME);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/image/upload`, {
                method: "post",
                body: data
            });

            if (res.status !== 200) {
                console.error("Unable to upload image");
                const error = await res.text();
                console.error(error);
                return '';
            }

            const imgLink = await res.json();
            return imgLink.secure_url;
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image");
            return '';
        }
    };

    const generateReport = async () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;

        // Draw background
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw report title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Charity Report', 50, 50);

        // Draw charity ID
        ctx.font = '18px Arial';
        ctx.fillText(`Campaign ID: ${charityId}`, 50, 100);

        // Draw report text
        ctx.font = '16px Arial';
        ctx.fillText(reportText, 50, 150, 700);

        // Draw uploaded images
        const imgYStart = 200;
        const imgWidth = 150;
        const imgHeight = 150;
        let imgX = 50;
        let imgY = imgYStart;

        for (let file of files) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
                    imgX += imgWidth + 20;
                    if (imgX > canvas.width - imgWidth) {
                        imgX = 50;
                        imgY += imgHeight + 20;
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const submitReport = async () => {
        try {
            if (contract) {
                await generateReport();

                const canvas = canvasRef.current;
                const image = canvas.toDataURL('image/png');

                const uploadedUrl = await handleUpload(image);
                if (!uploadedUrl) {
                    alert('No image uploaded. Report submission failed.');
                    return;
                }

                const transaction = await contract.submitReport(charityId, uploadedUrl);
                console.log('Transaction:', transaction);

                await transaction.wait();

                await saveReportDetails(transaction.hash, uploadedUrl, charityId);

                alert('Report submitted successfully');
                navigate('/reports');
            } else {
                alert('Metamask disconnected.');
            }
        } catch (error) {
            console.error('Error submitting report: ', error);
            alert('Failed to submit report.');
        }
    };

    const saveReportDetails = async (hash, report, charityId) => {
        try {
            const response = await axios.patch(`${process.env.REACT_APP_BACKEND_API}/report`, {
                hash,
                report,
                BcampaignId: charityId,
                campaignId: id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Report saved:', response.data);
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Failed to save report.');
        }
    };

    return (
        <div className="w-full h-screen flex justify-center items-center bg-gray-800">
            <div className="container md:ml-64 mx-auto my-10 p-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-6 text-center overflow-hidden">Submit Report</h1>
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
                <div className="mb-6">
                    <label className="block text-gray-400 font-medium mb-2" htmlFor="reportText">
                        Report Text
                    </label>
                    <textarea
                        id="reportText"
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter report details"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-400 font-medium mb-2" htmlFor="files">
                        Upload Report Files
                    </label>
                    <input
                        type="file"
                        id="files"
                        multiple
                        onChange={(e) => setFiles(e.target.files)}
                        className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                </div>
                <button
                    onClick={submitReport}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                    Submit Report
                </button>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
        </div>
    );
};

export default SubmitReport;
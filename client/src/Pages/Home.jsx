import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaComments } from 'react-icons/fa';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        console.log(token);
        console.log('Fetching campaigns from home ...');
        const response = await axios.get('http://localhost:5000/get-campaigns', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Response:', response);
        const formattedCampaigns = response.data.campaign.map(campaign => ({
          id: campaign._id,
          name: campaign.name,
          description: campaign.description,
          organization: campaign.organization,
          photo: campaign.photo,
          donatedAmount: null,
          totalAmtCollected: campaign.totalAmtCollected || 0,
          totalAmtRequired: campaign.totalAmtRequired || 0,
          daysLeft: campaign.daysLeft || 0
        }));
        setCampaigns(formattedCampaigns);
        setLoading(false);
      } catch (e) {
        console.error('Error fetching campaigns:', e);
        setError('Failed to load campaigns');
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleClick = (id) => {
    navigate(`/donate-campaign/${id}`);
  }
  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  if (loading) {
    return (
      <div className="ml-44 flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-44 flex items-center justify-center h-screen">
        <div className="text-red-500 text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className='ml-44 bg-slate-900 w-full text-center text-white min-h-screen flex flex-wrap items-center justify-center flex-col'>
      <h1 className='py-10 text-3xl font-semibold'>All Campaigns</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        {campaigns.map((campaign, index) => (
          <div
            onClick={() => handleClick(campaign.id)}
            key={campaign.id}
            className='max-w-xs bg-white rounded-xl shadow-lg overflow-hidden border border-green-200 shadow-green-100'
          >
            <img
              className='w-full h-30 object-cover'
              src={campaign.photo || 'https://media.istockphoto.com/id/1385717484/photo/ukrainians-outside-the-train-station-in-lviv-ukraine.jpg?s=612x612&w=0&k=20&c=V8qA7qRiFAuPl2OqJyLCOviMKEZufVeCFBPBj2MrwcU='}
              alt={campaign.name}
            />
            <div className='p-4'>
              <h2 className='text-xl font-bold text-slate-900'>{campaign.name}</h2>
              <p className='text-gray-700 mt-2'>{campaign.description}</p>
              <div className='mt-4 flex justify-between items-center'>
                {/* <div>
                  <div className='text-green-600 font-bold'>${campaign.totalAmtCollected}</div>
                  <div className='text-gray-600'>Raised out of ${campaign.totalAmtRequired}</div>
                </div>
                <div className='text-gray-600'>
                  <span className='font-bold'>{campaign.daysLeft}</span> Days Left
                </div> */}
              </div>
              {/* <div className='w-full bg-gray-300 rounded-full h-2.5 mt-2'>
                <div
                  className='bg-green-600 h-2.5 rounded-full'
                  style={{ width: `${(campaign.totalAmtCollected / campaign.totalAmtRequired) * 100}%` }}
                ></div>
              </div> */}
            </div>
          </div>
        ))}
      </div>

      {/* Chat icon */}
      <button
        className='fixed bottom-10 right-10 bg-green-600 text-white p-4 rounded-full shadow-lg'
        onClick={openChat}
      >
        <FaComments size={24} />
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg overflow-hidden w-full h-full max-w-5xl '>
            <div className='flex justify-between items-center p-4 bg-green-600 text-white'>
              <h2 className='text-xl'>Chat with Us</h2>
              <button className='text-xl' onClick={closeChat}>
                &times;
              </button>
            </div>
            <div className='p-4 h-full overflow-hidden'>
              <iframe
                src='https://chatbot-ml.vercel.app/'
                className='w-full h-full border-none'
                title='Chatbot'
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

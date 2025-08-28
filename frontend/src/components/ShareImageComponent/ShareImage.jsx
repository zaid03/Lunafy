import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import './ShareImage.css';

function ShareImage({ data, type, timeRange, onClose }) {
  const shareRef = useRef();

  const downloadImage = async () => {
    try {
      const element = shareRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: '#191414',
        scale: 2,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `lunafy-${type}-${timeRange}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const getTimeRangeText = () => {
    switch(timeRange) {
      case 'short_term': return 'Last 4 Weeks';
      case 'medium_term': return 'Last 6 Months';
      case 'long_term': return 'All Time';
      default: return 'Medium Term';
    }
  };

  const getTypeText = () => {
    switch(type) {
      case 'artists': return 'Top Artists';
      case 'songs': return 'Top Songs';
      case 'albums': return 'Top Albums';
      default: return 'Top Items';
    }
  };

  return (
    <div className="share-overlay">
      <div className="share-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div ref={shareRef} className="share-content">
          <div className="share-header">
            <h2>
              {type === 'Taste' ? 'My Music Taste Insight' : `My ${getTypeText()}`}
            </h2>
            <p>{getTimeRangeText()}</p>
            <span className="lunafy-brand">Lunafy</span>
          </div>
          
          {type === 'Taste' ? (
            <div className="share-paragraph">
              <p>{data[0]}</p>
            </div>
          ) : (
            <div className="share-list">
              {data.slice(0, 5).map((item, index) => (
                <div key={index} className="share-item">
                  <span className="share-rank">{index + 1}</span>
                  <img 
                    src={item.image_url} 
                    alt={type === 'artists' ? item.main_artist : item.track_name || item.album_name}
                    className="share-image"
                  />
                  <div className="share-info">
                    <span className="share-title">
                      {type === 'artists' 
                        ? item.main_artist 
                        : type === 'songs' 
                          ? item.track_name 
                          : item.album_name
                      }
                    </span>
                    {type !== 'artists' && (
                      <span className="share-artist">
                        {item.artist_name?.split(',')[0]?.trim()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="share-footer">
            <p>Generated with Lunafy</p>
          </div>
        </div>
        
        <div className="share-actions">
          <button className="download-btn" onClick={downloadImage}>
            Download Image
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareImage;
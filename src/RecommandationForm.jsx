import React, { useState } from 'react';
import { animated, useSpring, config } from 'react-spring';
import './RecommendationForm.css';
import { invokeModel } from './utils/client-bedrock-runtime';
import ReactMarkdown from 'react-markdown';

const AnimatedQuestion = ({ children, showBackButton, onBack }) => {
  const props = useSpring({
    opacity: 1,
    transform: 'translateY(0)',
    from: { opacity: 0, transform: 'translateY(50px)' },
    config: config.gentle,
  });
  return (
    <animated.div style={props} className="relative">
      {showBackButton && (
        
      
        <button onClick={onBack} className="absolute top-0 left-0  underline">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        </button>
      )}
      {children}
    </animated.div>
  );
};

const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Animation', 'Documentary', 'Biography', 'Crime'];

const RecommendationForm = ({ onSubmit }) => {
  const [type, setType] = useState('');
  const [favorite, setFavorite] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [listing, setListing] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleTypeChange = (e) => setType(e.target.value);
  const handleFavoriteChange = (e) => setFavorite(e.target.value);
  const handleGenreChange = (e) => setGenre(e.target.value);
  const handleMoodChange = (e) => setMood(e.target.value);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    try {
      const prompt = `Suggest me a list of 5 ${type} and my favorite ones are ${favorite} If i prefer the genre ${genre}. I am in a ${mood} mood. Give me only the name in a list. Only 5 names in a list`;
      const response = await invokeModel({
        modelId: 'amazon.titan-text-lite-v1',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: prompt,
          textGenerationConfig: {
            maxTokenCount: 300,
            stopSequences: [],
            temperature: 0,
            topP: 0.9,
          },
        }),
      });
  
      const responseBody = new TextDecoder().decode(response.body);
      const data = JSON.parse(responseBody);
      setListing(data.results[0].outputText); // Set the listing in state
      setFormSubmitted(true);
  
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  

  return (
    <div className="background-image">
      {!formSubmitted && ( // Show form only if form is not submitted
        <form onSubmit={handleSubmit} className="recommendation-form">
          <AnimatedQuestion showBackButton={step !== 1} onBack={prevStep}>
            {step === 1 && (
              <>
                <label htmlFor="type">What are you looking for recommendations in?</label>
                <select id="type" value={type} onChange={handleTypeChange} required>
                  <option value="">Select Type</option>
                  <option value="Books">Books</option>
                  <option value="Shows">Shows</option>
                  <option value="Movies">Movies</option>
                  <option value="Anime">Anime</option>
                </select>
                <button type="button" onClick={nextStep} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
                  Next
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <label htmlFor="favorite">What are your favorite {type.toLowerCase()}?</label>
                <input type="text" id="favorite" value={favorite} onChange={handleFavoriteChange} required />
                <button type="button" onClick={nextStep} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
                  Next
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <label htmlFor="genre">What genre do you prefer?</label>
                <select id="genre" value={genre} onChange={handleGenreChange} required>
                  <option value="">Select Genre</option>
                  {genres.map((genre, index) => (
                    <option key={index} value={genre}>{genre}</option>
                  ))}
                </select>
                <button type="button" onClick={nextStep} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
                  Next
                </button>
              </>
            )}
            {step === 4 && (
              <>
                <label htmlFor="mood">What mood are you in?</label>
                <select id="mood" value={mood} onChange={handleMoodChange} required>
                  <option value="">Select Mood</option>
                  <option value="Happy">Happy</option>
                  <option value="Sad">Sad</option>
                  <option value="Excited">Excited</option>
                  <option value="Relaxed">Relaxed</option>
                </select>
                <button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
                  {isLoading ? 'Getting Results...' : 'Submit'}
                </button>
              </>
            )}
          </AnimatedQuestion>
        </form>
      )}

      {/* Conditionally render the listing */}
      {listing && formSubmitted && (
        <div className="listing">
          <a href="/" className='text-sm hover:underline hover:text-blue-400'>Back</a>
          <h2 className="text-xl text-white">Recommendations</h2>
          <ReactMarkdown>{listing}</ReactMarkdown>
          {/* <p>{listing}</p> */}
        </div>
      )}
    </div>
  );
};

export default RecommendationForm;

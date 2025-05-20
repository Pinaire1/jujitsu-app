import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

// Sample jiu-jitsu techniques data
const techniques = [
  {
    id: 1,
    name: "Armbar from Guard",
    description:
      "Control your opponent's arm from the guard position, extend it away from their body and apply pressure to hyperextend the elbow joint.",
    difficulty: "Beginner",
    beltLevel: "WHITE",
  },
  {
    id: 2,
    name: "Triangle Choke",
    description:
      "From guard, trap one of your opponent's arms between your legs while securing their head and other arm in a figure-four leg lock, cutting off blood flow to the brain.",
    difficulty: "Beginner",
    beltLevel: "WHITE",
  },
  {
    id: 3,
    name: "Kimura",
    description:
      "A double-joint shoulder lock that attacks the shoulder and rotator cuff by isolating your opponent's arm behind their back in a figure-four grip.",
    difficulty: "Intermediate",
    beltLevel: "BLUE",
  },
  {
    id: 4,
    name: "De La Riva Guard",
    description:
      "An open guard position where you hook your outside foot around your opponent's lead leg while gripping their sleeve and ankle.",
    difficulty: "Intermediate",
    beltLevel: "BLUE",
  },
  {
    id: 5,
    name: "Berimbolo",
    description:
      "A sweeping technique from De La Riva guard that involves an inversion to take your opponent's back.",
    difficulty: "Advanced",
    beltLevel: "PURPLE",
  },
  {
    id: 6,
    name: "Omoplata",
    description:
      "A shoulder lock that uses your legs to apply pressure against your opponent's shoulder joint while controlling their arm.",
    difficulty: "Intermediate",
    beltLevel: "BLUE",
  },
  {
    id: 7,
    name: "North-South Choke",
    description:
      "A blood choke applied from the north-south position, using your shoulder and arm to compress the carotid arteries.",
    difficulty: "Advanced",
    beltLevel: "PURPLE",
  },
  {
    id: 8,
    name: "Rear Naked Choke",
    description:
      "A blood choke applied from behind your opponent, using your arm to compress the carotid arteries while controlling their body.",
    difficulty: "Beginner",
    beltLevel: "WHITE",
  },
  {
    id: 9,
    name: "X-Guard Sweep",
    description:
      "A powerful sweeping position where you position yourself under your opponent with one of your legs between their legs and the other hooked around their leg.",
    difficulty: "Advanced",
    beltLevel: "PURPLE",
  },
  {
    id: 10,
    name: "Bow and Arrow Choke",
    description:
      "A collar choke from the back where you pull on your opponent's collar while using your leg to create additional leverage.",
    difficulty: "Expert",
    beltLevel: "BROWN",
  },
  {
    id: 11,
    name: "Guillotine Choke",
    description:
      "A front headlock choke that compresses the trachea and/or carotid arteries using your arm wrapped around the opponent's neck.",
    difficulty: "Beginner",
    beltLevel: "WHITE",
  },
  {
    id: 12,
    name: "Half Guard to Back Take",
    description:
      "A sequence where you transition from half guard to taking your opponent's back by establishing underhooks and proper head position.",
    difficulty: "Advanced",
    beltLevel: "PURPLE",
  },
];

// Sample combination techniques
const combinations = [
  {
    id: 101,
    name: "Guard Pass to Mount to Armbar",
    description:
      "Pass your opponent's guard, establish mount position, and transition to an armbar submission.",
    difficulty: "Intermediate",
    beltLevel: "BLUE",
  },
  {
    id: 102,
    name: "Triangle to Omoplata to Armbar",
    description:
      "Chain three submissions together: start with a triangle attempt, transition to omoplata when defended, and finish with an armbar if necessary.",
    difficulty: "Advanced",
    beltLevel: "PURPLE",
  },
  {
    id: 103,
    name: "Kimura Trap System",
    description:
      "Use the kimura grip as a control system to set up sweeps, back takes, and submissions from various positions.",
    difficulty: "Expert",
    beltLevel: "BROWN",
  },
  {
    id: 104,
    name: "Single Leg to Double Leg to Back Take",
    description:
      "Initiate with a single leg takedown, transition to a double leg if defended, and finish by taking the back during the scramble.",
    difficulty: "Intermediate",
    beltLevel: "BLUE",
  },
  {
    id: 105,
    name: "Spider Guard to X-Guard to Leg Lock",
    description:
      "Control with spider guard, transition to X-guard as your opponent tries to pass, then attack with a leg lock entry.",
    difficulty: "Advanced",
    beltLevel: "PURPLE",
  },
  {
    id: 106,
    name: "Butterfly Sweep to Knee Cut Pass to Side Control",
    description:
      "Execute a butterfly sweep, immediately establish a knee cut passing position, and secure side control.",
    difficulty: "Intermediate",
    beltLevel: "BLUE",
  },
  {
    id: 107,
    name: "Collar Drag to Single Leg to Mount",
    description:
      "Use a collar drag to off-balance your opponent, convert to a single leg takedown, and establish mount position.",
    difficulty: "Intermediate",
    beltLevel: "BLUE",
  },
  {
    id: 108,
    name: "De La Riva to Berimbolo to Back Take",
    description:
      "Control with De La Riva guard, execute a berimbolo spin, and secure the back with hooks in.",
    difficulty: "Advanced",
    beltLevel: "PURPLE",
  },
];

// Combine both arrays for cycling
const allTechniques = [...techniques, ...combinations];

export const TechniqueCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(20);

  useEffect(() => {
    // Set up the interval to change techniques every 20 seconds
    const intervalId = setInterval(() => {
      setIsChanging(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % allTechniques.length);
        setIsChanging(false);
        setSecondsLeft(20);
      }, 500); // Fade out/in animation duration
    }, 20000);

    // Set up countdown timer
    const countdownId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return 20;
        return prev - 1;
      });
    }, 1000);

    // Clean up the intervals when component unmounts
    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, []);

  const currentTechnique = allTechniques[currentIndex];
  const { name, description, difficulty, beltLevel } = currentTechnique;

  const getBeltStyles = (level: string) => {
    switch (level) {
      case "WHITE":
        return "text-gray-800 bg-gray-100";
      case "BLUE":
        return "text-white bg-blue-500";
      case "PURPLE":
        return "text-white bg-purple-500";
      case "BROWN":
        return "text-white bg-amber-700";
      case "BLACK":
        return "text-white bg-gray-900";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative overflow-hidden rounded-lg p-6 bg-white shadow-lg transition-opacity duration-500 ${
          isChanging ? "opacity-0" : "opacity-100"
        }`}
        style={{
          borderWidth: "3px",
          borderStyle: "solid",
          borderImage:
            "linear-gradient(to right, #f3f4f6, #3b82f6, #8b5cf6, #92400e, #111827) 1",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${getBeltStyles(
              beltLevel
            )}`}
          >
            {difficulty}
          </span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Next in:</span>
            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full">
              {secondsLeft}s
            </span>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-3">{name}</h3>
        <p className="text-gray-700">{description}</p>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setIsChanging(true);
              setTimeout(() => {
                setCurrentIndex(
                  (prevIndex) =>
                    (prevIndex - 1 + allTechniques.length) %
                    allTechniques.length
                );
                setIsChanging(false);
                setSecondsLeft(20);
              }, 500);
            }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div className="flex space-x-1 overflow-hidden max-w-[100px]">
            {currentIndex > 0 && allTechniques.length > 5 && (
              <div className="text-gray-400 text-xs">...</div>
            )}
            {allTechniques.map((_, index) => {
              if (
                index === currentIndex ||
                index === currentIndex - 1 ||
                index === currentIndex + 1 ||
                index === currentIndex - 2 ||
                index === currentIndex + 2
              ) {
                return (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      currentIndex === index ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                );
              }
              return null;
            })}
            {currentIndex < allTechniques.length - 3 &&
              allTechniques.length > 5 && (
                <div className="text-gray-400 text-xs">...</div>
              )}
          </div>

          <button
            onClick={() => {
              setIsChanging(true);
              setTimeout(() => {
                setCurrentIndex(
                  (prevIndex) => (prevIndex + 1) % allTechniques.length
                );
                setIsChanging(false);
                setSecondsLeft(20);
              }, 500);
            }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechniqueCard;

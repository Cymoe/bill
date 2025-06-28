// ... existing code ...
              {industriesToDisplay.map(industry => (
                <span
                  key={industry.id}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 ${
                    industry.isPrimary
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                      : 'bg-gray-700/50 text-gray-300'
                  }`}
                >
                  {industry.name}
                  {industry.isPrimary && (
                    <span className="text-xs bg-blue-600/50 text-white px-2 py-0.5 rounded-md">
                      PRIMARY
                    </span>
                  )}
                </span>
              ))}
// ... existing code ...
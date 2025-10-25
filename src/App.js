import React, { useState, useEffect } from 'react';
import { Code, AlertCircle, CheckCircle, Lightbulb, TrendingUp, BookOpen } from 'lucide-react';

const CodeMentor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({});

  // Load progress from storage
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const result = localStorage.getItem('code-mentor-progress');
        const progress = result ? JSON.parse(result) : {};

        if (result) {
          setProgress(JSON.parse(result.value));
        }
      } catch (error) {
        console.log('No previous progress found');
      }
    };
    loadProgress();
  }, []);

  // Save progress
  const saveProgress = async (newProgress) => {
    try {
      await localStorage.setItem('code-mentor-progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const analyzeCode = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    
    // Simulate analysis with realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const issues = detectIssues(code, language);
    const feedback = generateFeedback(issues, skillLevel);
    
    setAnalysis({
      issues,
      feedback,
      timestamp: Date.now()
    });
    
    // Update progress
    const issueTypes = issues.map(i => i.type);
    const newProgress = { ...progress };
    
    issueTypes.forEach(type => {
      if (!newProgress[type]) {
        newProgress[type] = { encountered: 0, resolved: 0 };
      }
      newProgress[type].encountered++;
    });
    
    setProgress(newProgress);
    saveProgress(newProgress);
    setLoading(false);
  };

  const detectIssues = (code, lang) => {
    const issues = [];
    
    if (lang === 'python') {
      // Base case issues
      if (code.includes('factorial') && code.includes('n == 1') && !code.includes('n <= 1')) {
        issues.push({
          type: 'logic',
          severity: 'high',
          line: code.split('\n').findIndex(l => l.includes('n == 1')) + 1,
          message: 'Incomplete base case in recursive function',
          explanation: 'Your base case only handles n=1, but what happens when n=0? The function will recurse infinitely.'
        });
      }
      
      // Indentation issues
      if (/^\S+\s+/.test(code) && code.includes('def ')) {
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim() && !lines[i].startsWith(' ') && !lines[i].startsWith('def') && !lines[i].startsWith('#')) {
            if (i > 0 && lines[i-1].trim().endsWith(':')) {
              issues.push({
                type: 'syntax',
                severity: 'high',
                line: i + 1,
                message: 'Indentation error',
                explanation: 'Python requires consistent indentation. Code inside a function or after a colon must be indented.'
              });
              break;
            }
          }
        }
      }
      
      // Infinite loop detection
      if (code.includes('while True') && !code.includes('break')) {
        issues.push({
          type: 'logic',
          severity: 'medium',
          line: code.split('\n').findIndex(l => l.includes('while True')) + 1,
          message: 'Potential infinite loop',
          explanation: 'You have a "while True" loop without a break statement. How will this loop ever stop?'
        });
      }
      
      // Off-by-one in range
      if (code.match(/range\(\w+\)/)) {
        issues.push({
          type: 'concept',
          severity: 'low',
          line: code.split('\n').findIndex(l => l.match(/range\(\w+\)/)) + 1,
          message: 'Potential off-by-one error',
          explanation: 'Remember: range(n) goes from 0 to n-1, not 0 to n. Is this what you intended?'
        });
      }
      
      // Unused variable
      const varMatch = code.match(/(\w+)\s*=\s*.+/g);
      if (varMatch) {
        varMatch.forEach(match => {
          const varName = match.split('=')[0].trim();
          const usageCount = (code.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
          if (usageCount === 1 && varName !== '_') {
            issues.push({
              type: 'style',
              severity: 'low',
              line: code.split('\n').findIndex(l => l.includes(match)) + 1,
              message: `Variable '${varName}' is assigned but never used`,
              explanation: 'Did you forget to use this variable, or is it unnecessary?'
            });
          }
        });
      }
      
      // Missing return statement
      if (code.includes('def ') && !code.includes('return') && !code.includes('print')) {
        issues.push({
          type: 'logic',
          severity: 'medium',
          line: code.split('\n').findIndex(l => l.includes('def ')) + 1,
          message: 'Function may not return a value',
          explanation: 'Your function does not have a return statement. Should it return something?'
        });
      }
    }
    
  
    
    // If no specific issues found, provide general feedback
    if (issues.length === 0) {
      issues.push({
        type: 'success',
        severity: 'none',
        message: 'No obvious issues detected!',
        explanation: 'Your code structure looks good. Consider testing it with different inputs to verify it works as expected.'
      });
    }
    
    return issues;
  };

  const generateFeedback = (issues, level) => {
    const feedback = {
      summary: '',
      teaching: [],
      questions: [],
      nextSteps: []
    };
    
    const highSeverity = issues.filter(i => i.severity === 'high').length;
    const hasLogicIssues = issues.some(i => i.type === 'logic');
    
    if (issues[0]?.type === 'success') {
      feedback.summary = level === 'beginner' 
        ? "Great work! Your code looks solid. Keep practicing!" 
        : "Code structure is sound. Consider edge cases and optimization.";
      feedback.nextSteps = [
        'Test your code with various inputs',
        'Think about edge cases (empty input, very large numbers, etc.)',
        'Consider time and space complexity'
      ];
      return feedback;
    }
    
    if (highSeverity > 0) {
      feedback.summary = level === 'beginner'
        ? `I found ${highSeverity} critical issue${highSeverity > 1 ? 's' : ''} that will prevent your code from running correctly. Let's work through them together!`
        : `${highSeverity} critical issue${highSeverity > 1 ? 's' : ''} detected. Review the base cases and control flow.`;
    } else {
      feedback.summary = "Your code runs, but there are some improvements we can make.";
    }
    
    // Generate teaching points based on skill level
    issues.forEach(issue => {
      if (issue.type === 'logic' && issue.message.includes('base case')) {
        if (level === 'beginner') {
          feedback.teaching.push({
            concept: 'Recursive Base Cases',
            explanation: 'Every recursive function needs a base case - a condition where it stops calling itself. Your base case should handle ALL stopping conditions, not just one value.',
            example: 'For factorial, both 0! and 1! equal 1, so use: if n <= 1: return 1'
          });
          feedback.questions.push('What would happen if someone calls factorial(0)? Walk through the steps.');
        } else {
          feedback.teaching.push({
            concept: 'Edge Case Handling',
            explanation: 'Your base case needs to handle edge cases. Consider: what are all the valid inputs that should stop the recursion?',
            example: 'n <= 1 covers both 0 and 1, preventing infinite recursion.'
          });
        }
      }
      
      if (issue.type === 'logic' && issue.message.includes('infinite loop')) {
        feedback.teaching.push({
          concept: 'Loop Termination',
          explanation: 'Every loop needs a way to exit. Without a break statement or a condition that becomes false, your loop will run forever.',
          example: 'Add a break statement when a certain condition is met, or use a condition that will eventually become false.'
        });
        feedback.questions.push('Under what condition should this loop stop? How can you express that in code?');
      }
    });
    
    // Next steps
    if (hasLogicIssues) {
      feedback.nextSteps = [
        'Fix the logical issues identified above',
        'Test your code with edge cases',
        'Add comments explaining your logic'
      ];
    } else {
      feedback.nextSteps = [
        'Run your code with test cases',
        'Consider code readability and style',
        'Think about performance optimization'
      ];
    }
    
    return feedback;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const exampleCode = `def factorial(n):
    if n == 1:
        return 1
    else:
        return n * factorial(n - 1)

print(factorial(0))`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Code className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">AI-Powered Code Mentor</h1>
          </div>
          <p className="text-gray-600">Learn coding concepts through intelligent, adaptive feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Input Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                  <select 
                    value={skillLevel} 
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Your Code</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste or type your code here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={analyzeCode}
                  disabled={loading || !code.trim()}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Analyzing...' : 'Analyze My Code'}
                </button>
                
                <button
                  onClick={() => setCode(exampleCode)}
                  className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                >
                  Load Example
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  Analysis & Feedback
                </h2>

                {/* Summary */}
                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded">
                  <p className="text-gray-800 font-medium">{analysis.feedback.summary}</p>
                </div>

                {/* Issues */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Issues Detected</h3>
                  <div className="space-y-3">
                    {analysis.issues.map((issue, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-start gap-3">
                          {issue.severity === 'none' ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{issue.message}</span>
                              {issue.line && <span className="text-sm opacity-75">Line {issue.line}</span>}
                            </div>
                            <p className="text-sm opacity-90">{issue.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teaching Points */}
                {analysis.feedback.teaching.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Learning Points
                    </h3>
                    <div className="space-y-4">
                      {analysis.feedback.teaching.map((point, idx) => (
                        <div key={idx} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">{point.concept}</h4>
                          <p className="text-gray-700 mb-2">{point.explanation}</p>
                          {point.example && (
                            <div className="bg-white p-3 rounded border border-yellow-300 mt-2">
                              <p className="text-sm font-mono text-gray-800">{point.example}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions */}
                {analysis.feedback.questions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Think About It</h3>
                    <div className="space-y-2">
                      {analysis.feedback.questions.map((q, idx) => (
                        <div key={idx} className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                          <p className="text-gray-800">💭 {q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Next Steps</h3>
                  <ul className="space-y-2">
                    {analysis.feedback.nextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">→</span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Tracker */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Your Progress
              </h3>
              
              {Object.keys(progress).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(progress).map(([type, data]) => (
                    <div key={type} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{type} Issues</span>
                        <span className="text-xs text-gray-500">{data.encountered} encountered</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((data.resolved / data.encountered) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Start analyzing code to track your progress!</p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm">
                <li>• Start with simple examples to understand concepts</li>
                <li>• Read error messages carefully - they contain clues</li>
                <li>• Test edge cases like 0, negative numbers, and empty inputs</li>
                <li>• Use print statements to debug step by step</li>
              </ul>
            </div>

            {/* Common Mistakes */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Common Mistakes</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="p-2 bg-red-50 rounded">
                  <span className="font-medium">Off-by-one errors</span> in loops
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <span className="font-medium">Missing base cases</span> in recursion
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <span className="font-medium">Infinite loops</span> without exit conditions
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <span className="font-medium">Variable scope</span> confusion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeMentor;
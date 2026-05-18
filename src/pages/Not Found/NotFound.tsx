// import React from 'react'

// const NotFound:React.FC = () => {
//   return (
//     <div style={{margin: "50px 20px", padding: "0px" , fontSize: "30px", fontWeight: "600"}}>
//                 Page not found 404...
//     </div>
//   )
// }

// export default NotFound


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button'; // Adjust path based on your file tree

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 bg-background animate-in fade-in duration-300">
            <div className="max-w-md w-full text-center p-8 bg-surface border border-border rounded-2xl shadow-sm flex flex-col items-center">
                
                {/* --- School Themed Illustration Assembly --- */}
                <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
                    {/* Background Pulse Ring */}
                    <div className="absolute inset-0 rounded-full bg-primary-soft opacity-60" />
                    
                    {/* Structural Accent Card */}
                    <div className="absolute w-28 h-28 rounded-2xl bg-sub-header rotate-12 border border-border opacity-80" />
                    <div className="absolute w-28 h-28 rounded-2xl bg-surface -rotate-6 border border-border shadow-sm flex items-center justify-center">
                        
                        {/* Layered FontAwesome School System Emblems */}
                        <div className="relative text-primary">
                            <i className="fas fa-graduation-cap text-5xl transform -translate-y-2"></i>
                            <i className="fas fa-search text-2xl text-muted absolute -bottom-1 -right-2 bg-surface p-1 rounded-full border border-border"></i>
                        </div>
                    </div>
                    
                    {/* Floating Decorative School Elements */}
                    <i className="fas fa-book text-primary/40 text-lg absolute top-4 left-2 duration-700" />
                    <i className="fas fa-pencil-alt text-muted/60 text-base absolute bottom-6 left-4 transform -rotate-45" />
                    <i className="fas fa-calculator text-primary/30 text-lg absolute top-6 right-2" />
                    <i className="fas fa-apple-alt text-danger/30 text-base absolute bottom-8 right-2" />
                </div>

                {/* --- Text Content --- */}
                <h1 className="text-6xl font-black text-primary tracking-tight">404</h1>
                
                <h2 className="text-xl font-bold text-foreground mt-3 mb-2">
                    Page Not Found
                </h2>
                
                <p className="text-sm text-muted max-w-sm mb-8 leading-relaxed">
                    The page or resource you are looking for has been moved, archived, or doesn't exist in this school directory.
                </p>

                {/* --- Operational Action Buttons --- */}
                <div className="w-full flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        leftIcon="fas fa-arrow-left"
                        className="w-full sm:w-auto px-5"
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/dashboard')}
                        leftIcon="fas fa-th-large"
                        className="w-full sm:w-auto px-5"
                    >
                        Return to Dashboard
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default NotFound;
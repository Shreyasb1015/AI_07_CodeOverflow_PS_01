/* eslint-disable react-hooks/exhaustive-deps */
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ReviewCard from "../components/ui/card";
import { Accordion, AccordionItem } from "../components/ui/Accordion";
import Chatbot from "../components/Chatbot/Chatbot"; 
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Home = () => {

  const user=localStorage.getItem("currentUser");
  const navigate=useNavigate();
  useEffect(() => {
    if(!user)
      {
        console.log(user);
        navigate('/login');
      }
  }, []);

  const reviews = [
    {
      name: "Sarah Johnson",
      role: "CTO @TechCorp",
      feedback: "TechWave transformed our business operations completely!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Startup Founder",
      feedback: "The best platform for scalable solutions. Highly recommended!",
      rating: 5,
    },
    {
      name: "Emma Wilson",
      role: "Product Manager",
      feedback: "Intuitive interface with powerful features. Love it!",
      rating: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl space-y-6"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-orange-800 bg-clip-text text-transparent">
              Transform Your Digital Presence
            </h1>

            <div className="text-2xl md:text-3xl text-muted-foreground">
              <Typewriter
                words={[
                  "AI-Powered Solutions",
                  "Cloud Infrastructure",
                  "Real-Time Analytics",
                  "Enterprise Security",
                ]}
                loop={true}
                cursor
                cursorStyle="|"
                typeSpeed={70}
                deleteSpeed={50}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex gap-4 justify-center mt-8"
            >
              <button className="bg-primary text-white dark:text-slate-900 px-8 py-3 rounded-full text-lg hover:bg-primary/90 transition-all">
                Get Started
              </button>
              <button className="border px-8 py-3 rounded-full text-lg hover:border-primary transition-all">
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="my-24">
          <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Integration",
                desc: "Smart solutions powered by machine learning",
                icon: "🤖",
              },
              {
                title: "Real-Time Analytics",
                desc: "Instant insights with interactive dashboards",
                icon: "📊",
              },
              {
                title: "Cloud Native",
                desc: "Scalable infrastructure on secure cloud",
                icon: "☁️",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="p-8 rounded-xl border hover:border-primary/50 transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:text-primary transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="my-24">
          <h2 className="text-4xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <ReviewCard key={index} review={review} index={index} />
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="my-24 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion>
            <AccordionItem
              title="What makes TechWave different?"
              content="Our unique combination of AI-powered analytics and enterprise-grade security sets us apart from competitors."
            />
            <AccordionItem
              title="How secure is my data?"
              content="We use military-grade encryption and comply with all major data protection regulations."
            />
            <AccordionItem
              title="Can I integrate with existing tools?"
              content="Yes! We offer seamless integration with all popular productivity and analytics tools."
            />
            <AccordionItem
              title="What support options are available?"
              content="24/7 premium support with dedicated account managers for enterprise clients."
            />
          </Accordion>
        </section>
      </main>

      <Footer />

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Home;
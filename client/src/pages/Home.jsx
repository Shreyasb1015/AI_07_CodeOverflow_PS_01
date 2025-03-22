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
  const user = localStorage.getItem("currentUser");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log(user);
      navigate("/login");
    }
  }, []);

  const reviews = [
    {
      name: "Rajesh Kumar",
      role: "CFO @Manufacturing Inc.",
      feedback:
        "EchoMind transformed our GST compliance process. It’s like having an expert available 24/7!",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Production Manager",
      feedback:
        "The AI-guided workflows have made production planning seamless and efficient.",
      rating: 5,
    },
    {
      name: "Anil Mehta",
      role: "Sales Lead",
      feedback:
        "From order tracking to E-Way Bills, EchoMind has simplified everything. Highly recommended!",
      rating: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="min-h-[100vh] flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline // Ensures video plays on mobile devices
            className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-50"
          >
            <source
              src="src/assets/videos/cool-bg.mp4" // Replace with the correct path to your video
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl space-y-6 relative z-10"
          >
            <h1 className="text-3xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-800 bg-clip-text text-transparent">
              Intelligent Responses. Human Touch
            </h1>

            <div className="text-2xl md:text-3xl text-muted-foreground">
              <Typewriter
                words={[
                  "Seamless ERP Integration",
                  "AI-Driven Insights",
                  "Real-Time Data Analytics",
                  "Automated GST Compliance",
                  "Streamlined Inventory Management",
                  "Advanced User Access Control",
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
                title: "AI-Driven Support",
                desc: "Get instant, human-like assistance for all ERP workflows.",
                icon: "🤖",
              },
              {
                title: "GST Compliance",
                desc: "Automated GST calculations, e-invoicing, and return filing.",
                icon: "📊",
              },
              {
                title: "Real-Time Insights",
                desc: "Interactive dashboards for sales, production, and inventory.",
                icon: "📈",
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
          <h2 className="text-4xl font-bold text-center mb-12">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <ReviewCard key={index} review={review} index={index} />
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="my-24 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion>
            <AccordionItem
              title="What makes EchoMind different?"
              content="EchoMind combines AI-powered conversational support with deep ERP integration, making it feel like you’re talking to an expert."
            />
            <AccordionItem
              title="How secure is my ERP data?"
              content="We use enterprise-grade encryption and comply with all data protection regulations to keep your data safe."
            />
            <AccordionItem
              title="Can EchoMind handle GST compliance?"
              content="Yes! EchoMind automates GST calculations, e-invoicing, and return filing, ensuring full compliance."
            />
            <AccordionItem
              title="What support options are available?"
              content="We offer 24/7 AI-driven support, with human escalation for complex queries."
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
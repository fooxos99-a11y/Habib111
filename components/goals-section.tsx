import { BookOpen, Heart, CheckCircle, Users } from 'lucide-react'

const goals = [
  {
    icon: BookOpen,
    title: "إتقان القرآن",
  },
  {
    icon: Heart,
    title: "ترسيخ القيم",
  },
  {
    icon: CheckCircle,
    title: "تعزيز الانضباط والمسؤولية",
  },
  {
    icon: Users,
    title: "إعداد جيل مؤثر في مجتمعه",
  },
]

export function GoalsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 sm:mb-12 md:mb-16 text-[#1a2332]">
          أهداف إثراء
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {goals.map((goal, index) => (
            <div
              key={index}
              className="bg-white border-2 border-[#d8a355] rounded-lg p-6 sm:p-7 md:p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#d8a355] rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <goal.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1a2332]">{goal.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

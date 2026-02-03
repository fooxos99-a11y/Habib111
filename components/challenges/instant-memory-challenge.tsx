"use client"

import { useState, useEffect } from "react"
import { Clock, Eye, EyeOff } from "lucide-react"

interface Item {
  id: number
  color: string
  shape: string
  originalIndex: number
}

interface InstantMemoryChallengeProps {
  onSuccess: () => void
  onFailure: (message: string) => void
  timeLimit?: number
}

export function InstantMemoryChallenge({ onSuccess, onFailure, timeLimit = 60 }: InstantMemoryChallengeProps) {
    // منع التمرير أثناء عرض اللعبة
    useEffect(() => {
      document.body.classList.add('overflow-hidden')
      return () => {
        document.body.classList.remove('overflow-hidden')
      }
    }, [])
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [timerActive, setTimerActive] = useState(true)
  const [currentRound, setCurrentRound] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [memorizeTime, setMemorizeTime] = useState(60)
  const [phase, setPhase] = useState<"memorize" | "recall">("memorize")
  const [items, setItems] = useState<Item[]>([])
  const [availableItems, setAvailableItems] = useState<Item[]>([])
  const [placedItems, setPlacedItems] = useState<(Item | null)[]>([])
  const [draggedItem, setDraggedItem] = useState<Item | null>(null)
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null)
  const [isTouchDragging, setIsTouchDragging] = useState(false)

  const colors = ["#FF6B9D", "#4ECDC4", "#FFE66D", "#A8E6CF", "#FF8B94", "#C7CEEA"]
  const shapes = ["circle", "square", "triangle", "diamond", "star", "hexagon"]

  useEffect(() => {
    generateNewRound()
  }, [])

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setTimerActive(false)
        onFailure("انتهى الوقت قبل إكمال التحدي")
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false)
          onFailure("انتهى الوقت قبل إكمال التحدي")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timerActive, timeLeft])

  useEffect(() => {
    if (phase === "memorize" && memorizeTime > 0) {
      const timer = setTimeout(() => {
        setMemorizeTime((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (phase === "memorize" && memorizeTime === 0) {
      setPhase("recall")
    }
  }, [memorizeTime, phase])

  const generateNewRound = () => {
    const itemCount = 3 + currentRound
    const newItems: Item[] = []

    const shuffledColors = [...colors].sort(() => Math.random() - 0.5)

    for (let i = 0; i < itemCount; i++) {
      newItems.push({
        id: i,
        color: shuffledColors[i % shuffledColors.length],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        originalIndex: i,
      })
    }

    setItems(newItems)
    setAvailableItems([...newItems].sort(() => Math.random() - 0.5))
    setPlacedItems(new Array(newItems.length).fill(null))
    setPhase("memorize")
    setMemorizeTime(10)
  }

  const handleDragStart = (item: Item) => {
    setDraggedItem(item)
  }

  // Touch drag handlers
  const handleTouchStart = (item: Item, e: React.TouchEvent) => {
    setDraggedItem(item)
    setIsTouchDragging(true)
    // تعطيل التمرير أثناء السحب
    document.body.style.overflow = 'hidden';
    setTouchPosition({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDragging) return
    e.preventDefault();
    setTouchPosition({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouchDragging || !draggedItem) {
      setIsTouchDragging(false)
      setDraggedItem(null)
      setTouchPosition(null)
      document.body.style.overflow = '';
      return
    }
    // Find the drop zone under the touch point
    const touch = e.changedTouches[0]
    const elem = document.elementFromPoint(touch.clientX, touch.clientY)
    let dropped = false;
    if (elem) {
      const dropZone = elem.closest('[data-drop-slot]') as HTMLElement | null
      if (dropZone && dropZone.dataset.dropSlot) {
        const slotIndex = parseInt(dropZone.dataset.dropSlot, 10)
        handleDrop(slotIndex)
        dropped = true;
      }
    }
    // إذا لم يُسقط في مربع صحيح يرجع لمكانه
    if (!dropped) {
      setIsTouchDragging(false)
      setDraggedItem(null)
      setTouchPosition(null)
      document.body.style.overflow = '';
    }
  }

  const handleDrop = (slotIndex: number) => {
    if (!draggedItem || gameOver || phase === "memorize") return

    if (placedItems[slotIndex] !== null) return

    const newPlacedItems = [...placedItems]
    newPlacedItems[slotIndex] = draggedItem
    setPlacedItems(newPlacedItems)

    const newAvailableItems = availableItems.filter((item) => item.id !== draggedItem.id)
    setAvailableItems(newAvailableItems)

    setDraggedItem(null)

    const filledCount = newPlacedItems.filter((item) => item !== null).length
    if (filledCount === items.length) {
      checkAnswer(newPlacedItems)
    }
  }

  const handleRemoveFromSlot = (slotIndex: number) => {
    if (phase === "memorize" || gameOver) return

    const removedItem = placedItems[slotIndex]
    if (!removedItem) return

    const newPlacedItems = [...placedItems]
    newPlacedItems[slotIndex] = null
    setPlacedItems(newPlacedItems)

    setAvailableItems([...availableItems, removedItem])
  }

  const checkAnswer = (finalPlacement: (Item | null)[]) => {
    const isCorrect = finalPlacement.every((item, index) => item && item.id === items[index].id)

    if (!isCorrect) {
      setTimerActive(false)
      setGameOver(true)
      onFailure("ترتيب خاطئ! حاول مرة أخرى غداً")
      return
    }

    if (currentRound === 2) {
      setTimerActive(false)
      onSuccess()
    } else {
      setCurrentRound(currentRound + 1)
      setTimeout(() => {
        generateNewRound()
      }, 1000)
    }
  }

  const renderShape = (item: Item, context: "memorize" | "available" | "placed", slotIndex?: number) => {
    const shapeStyles: Record<string, string> = {
      square: "rounded-2xl",
      circle: "rounded-full",
      triangle: "rounded-2xl",
      diamond: "rounded-2xl",
      star: "rounded-2xl",
      hexagon: "rounded-2xl",
    }

    const clipPaths: Record<string, string> = {
      square: "none",
      circle: "none",
      triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
      diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
      star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    }

    if (context === "available" && phase === "recall") {
      const isDragging = isTouchDragging && draggedItem?.id === item.id;
      // الحجم الفعلي للشكل
      const size = window.innerWidth < 640 ? 56 : 80; // w-14/h-14 = 56px, w-20/h-20 = 80px
      return (
        <div
          draggable
          onDragStart={() => handleDragStart(item)}
          onTouchStart={(e) => handleTouchStart(item, e)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`w-20 h-20 transition-all duration-100 shadow-lg cursor-move hover:scale-110 hover:shadow-xl active:scale-95 ${shapeStyles[item.shape]} ${isDragging ? 'pointer-events-auto' : ''}`}
          style={{
            backgroundColor: item.color,
            clipPath: clipPaths[item.shape],
            zIndex: isDragging ? 100 : undefined,
            position: isDragging ? 'fixed' : undefined,
            left: isDragging && touchPosition ? touchPosition.x - size / 2 : undefined,
            top: isDragging && touchPosition ? touchPosition.y - size / 2 : undefined,
            opacity: isDragging ? 0.95 : 1,
            pointerEvents: isDragging ? 'auto' : undefined,
            touchAction: isDragging ? 'none' : undefined,
            transform: isDragging ? 'none' : undefined,
          }}
        />
      )
    }

    if (context === "placed" && phase === "recall") {
      return (
        <div
          onClick={() => slotIndex !== undefined && handleRemoveFromSlot(slotIndex)}
          className={`w-20 h-20 transition-all duration-300 shadow-lg cursor-pointer hover:opacity-80 ${shapeStyles[item.shape]}`}
          style={{
            backgroundColor: item.color,
            clipPath: clipPaths[item.shape],
          }}
        />
      )
    }

    return (
      <div
        className={`w-24 h-24 transition-all duration-300 shadow-lg ${shapeStyles[item.shape]}`}
        style={{
          backgroundColor: item.color,
          clipPath: clipPaths[item.shape],
        }}
      />
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4 flex gap-4">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full">
          <Clock className="w-5 h-5 text-[#D4AF37]" />
          <span className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-[#1a2332]"}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full">
          <span className="text-xl font-bold text-[#1a2332]">الجولة {currentRound}/2</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#1a2332] mb-2">لعبة الذاكرة اللحظية</h2>
        {phase === "memorize" ? (
          <div className="flex items-center justify-center gap-2 text-xl text-[#D4AF37]">
            <Eye className="w-6 h-6" />
            <p>احفظ الترتيب لمدة 10 ثواني! {memorizeTime} ثانية متبقية</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xl text-[#D4AF37]">
            <EyeOff className="w-6 h-6" />
            <p>اسحب الأشكال من الأسفل ورتبها بنفس الترتيب!</p>
          </div>
        )}
      </div>

      {phase === "memorize" && (
        <div className="relative w-full max-w-4xl min-h-[400px] bg-white/50 rounded-3xl border-4 border-[#D4AF37]/30 shadow-2xl flex items-center justify-center p-8">
          <div className="flex flex-wrap gap-6 justify-center items-center">
            {items.map((item, index) => (
              <div key={item.id}>{renderShape(item, "memorize")}</div>
            ))}
          </div>
        </div>
      )}

      {phase === "recall" && (
        <div className="w-full max-w-4xl space-y-8">
          {/* Drop zones with numbers */}
          <div className="bg-white/50 rounded-3xl border-4 border-[#D4AF37]/30 shadow-2xl p-8">
            <div className="flex flex-wrap gap-6 justify-center items-center">
              {placedItems.map((placedItem, index) => (
                <div
                  key={index}
                  data-drop-slot={index}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className="relative w-24 h-24 border-4 border-dashed border-[#D4AF37] rounded-2xl flex items-center justify-center bg-white/70 hover:bg-white/90 transition-all"
                >
                  {placedItem ? (
                    renderShape(placedItem, "placed", index)
                  ) : (
                    <span className="text-5xl font-bold text-[#D4AF37]/50">{index + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Available items to drag */}
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#C9A961]/10 rounded-3xl border-4 border-[#D4AF37]/20 shadow-xl p-6 pb-24">
            <p className="text-center text-lg font-bold text-[#1a2332] mb-4">اسحب الأشكال من هنا</p>
            <div className="grid grid-cols-2 gap-4 justify-center items-center min-h-[100px]">
              {availableItems.map((item) => (
                <div key={item.id}>{renderShape(item, "available")}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

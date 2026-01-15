function AboutTab() {
  return (
    <div className="space-y-6">
      {/* What is 75 Smart */}
      <Section title="What is 75 Smart?">
        <p className="text-gray-400 text-sm leading-relaxed">
          75 Smart is a 75-day mental discipline challenge designed for knowledge workers.
          Unlike fitness-focused challenges, 75 Smart targets intellectual growth and
          productivity habits.
        </p>
      </Section>

      {/* The Rules */}
      <Section title="The Rules">
        <div className="space-y-4">
          <Rule number="1" title="Complete ALL your daily tasks">
            You define 3-8 personal rules. Every single one must be completed
            each day for the day to count.
          </Rule>
          <Rule number="2" title="75 consecutive days">
            The challenge runs for 75 days. Build momentum through consistency.
          </Rule>
          <Rule number="3" title="Miss 1 day = Warning">
            Life happens. Miss one day and you get a warning, but you can
            continue the next day.
          </Rule>
          <Rule number="4" title="Miss 2 days = Reset">
            Miss two consecutive days and your challenge resets to Day 0.
            This creates real accountability.
          </Rule>
          <Rule number="5" title="Edit rules = Reset">
            You can change your rules anytime, but doing so resets your
            progress. Commit to your choices.
          </Rule>
        </div>
      </Section>

      {/* Default Smart Rules */}
      <Section title="Mohammed's Smart Rules">
        <p className="text-gray-500 text-sm mb-4">
          The default template, designed for deep work and intellectual growth:
        </p>
        <div className="space-y-2">
          <DefaultRule>Deep Learning Session 1 (30-45 min)</DefaultRule>
          <DefaultRule>Deep Learning Session 2 (30-45 min)</DefaultRule>
          <DefaultRule>15 min Meta-Learning</DefaultRule>
          <DefaultRule>Create 1 Intellectual Output</DefaultRule>
          <DefaultRule>Read 10 Pages Non-Fiction</DefaultRule>
          <DefaultRule>No Low-Value Dopamine Before 8pm</DefaultRule>
        </div>
      </Section>

      {/* Why It Works */}
      <Section title="Why It Works">
        <div className="space-y-3 text-gray-400 text-sm">
          <p>
            <span className="text-white font-medium">Accountability without punishment.</span>{" "}
            The 2-day grace period means a bad day won't derail you, but
            consistent neglect will.
          </p>
          <p>
            <span className="text-white font-medium">Customizable to your goals.</span>{" "}
            Your rules, your challenge. Whether it's coding, writing, or learning
            a language.
          </p>
          <p>
            <span className="text-white font-medium">75 days builds habits.</span>{" "}
            Research suggests 66+ days to form lasting habits. 75 gives you
            buffer and builds real discipline.
          </p>
        </div>
      </Section>

      {/* Tips */}
      <Section title="Tips for Success">
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex gap-2">
            <span className="text-gray-600">•</span>
            <span>Start with rules you can realistically complete daily</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-600">•</span>
            <span>Check in at the same time each day (evening works well)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-600">•</span>
            <span>Use the reflection feature to track what's working</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-600">•</span>
            <span>If you reset, analyze why and adjust your rules</span>
          </li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border border-gray-800 rounded-lg p-4">
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Rule({ number, title, children }) {
  return (
    <div className="flex gap-3">
      <span className="text-gray-600 text-xs font-medium w-4">{number}.</span>
      <div>
        <p className="text-white text-sm font-medium">{title}</p>
        <p className="text-gray-500 text-xs mt-1">{children}</p>
      </div>
    </div>
  );
}

function DefaultRule({ children }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
      <span className="text-gray-600 text-xs">→</span>
      <span className="text-gray-300 text-sm">{children}</span>
    </div>
  );
}

export default AboutTab;

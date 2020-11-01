import React from "react";

const rollDie = (upTo: number) => {
  return Math.floor(Math.random() * upTo) + 1;
};

interface DieProps {
  type: number;
  lastRoll: number | undefined;
}

const Die: React.FC<DieProps> = ({ type, lastRoll }) => {
  return (
    <div style={{ display: "flex" }}>
      <span>
        D{type}: {` `}
        {lastRoll !== undefined && lastRoll}
        {lastRoll === undefined && "nope"}
      </span>
    </div>
  );
};

interface DieType {
  type: number;
}

interface DiceGroupProps {
  name: string;
  setName: (newName: string) => void;
  dice: DieType[];
  addDie: (type: number) => void;
}

const DiceGroup: React.FC<DiceGroupProps> = ({
  name,
  setName,
  dice,
  addDie,
}) => {
  const [lastRolls, setLastRolls] = React.useState<number[]>([]);
  const [localName, setLocalName] = React.useState(name);
  const [nextDie, setNextDie] = React.useState("6");

  const rollGroup = React.useCallback(() => {
    setLastRolls(dice.map(({ type }) => rollDie(type)));
  }, [dice]);

  const [isNaming, setIsNaming] = React.useState(false);

  return (
    <div>
      <div>
        {!isNaming && (
          <h3 onClick={() => setIsNaming((old) => !old)}>
            {name || "Unnamed Group. Click to name"}
          </h3>
        )}
        {isNaming && (
          <div>
            <input
              value={localName}
              onBlur={() => {
                setIsNaming(false);
                setName(localName);
              }}
              onChange={(e) => setLocalName(e.target.value)}
            />
            <button
              onClick={() => {
                setIsNaming(false);
                setName(localName);
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
      <button
        onClick={() => {
          const next = parseInt(nextDie);
          if (isNaN(next)) {
            return;
          }
          addDie(next);
        }}
      >
        Add Die
      </button>
      {dice.length > 0 && <button onClick={rollGroup}>Roll Group</button>}
      <input
        value={nextDie}
        onChange={(e) => {
          setNextDie(e.target.value);
        }}
      />
      {dice.map(({ type }, idx) => (
        <Die key={`${type}-${idx}`} type={type} lastRoll={lastRolls[idx]} />
      ))}
      {lastRolls.every((a) => a !== undefined) && (
        <div>Total: {lastRolls.reduce((a, b) => a + b, 0)}</div>
      )}
    </div>
  );
};

interface Group {
  name: string;
  dice: DieType[];
}

const groupKey = "groups";

function App() {
  const [groups, setGroups] = React.useState<Group[]>(() => {
    const groupsString = window.localStorage.getItem(groupKey);
    if (groupsString !== null) {
      const parsed = JSON.parse(groupsString);
      return parsed;
    }
    return [];
  });

  React.useEffect(() => {
    const groupsString = JSON.stringify(groups);
    window.localStorage.setItem(groupKey, groupsString);
  }, [groups]);

  const addGroup = React.useCallback(() => {
    setGroups((old) =>
      old.concat([{ name: "Unnamed. Click to name", dice: [] }])
    );
  }, []);

  const setName = React.useCallback(
    (groupIdx: number) => (newName: string) => {
      setGroups((old) =>
        old.map((group, gi) => {
          if (gi === groupIdx) {
            return { ...group, name: newName };
          } else {
            return group;
          }
        })
      );
    },
    []
  );

  const addDie = React.useCallback(
    (groupIdx: number) => (upTo: number) => {
      setGroups((old) =>
        old.map((group, gi) => {
          if (gi === groupIdx) {
            return { ...group, dice: group.dice.concat([{ type: upTo }]) };
          } else {
            return group;
          }
        })
      );
    },
    []
  );

  return (
    <div className="App">
      <p>No, you're a dice app</p>
      <button onClick={addGroup}>Add group</button>
      {groups.map(({ name, dice }, idx) => {
        return (
          <DiceGroup
            key={idx}
            name={name}
            dice={dice}
            setName={setName(idx)}
            addDie={addDie(idx)}
          />
        );
      })}
    </div>
  );
}

export default App;
